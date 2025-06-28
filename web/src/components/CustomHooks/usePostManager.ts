import { useMemo, useState, useEffect } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    useQuery
} from '@tanstack/react-query';
import { api } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Post } from "@/type/Post";
import type { CreatePostDTO, DeletePostDTO } from "@/type/Post";
import type { CreateCommentDTO, Comment } from "@/type/Comment"; 
import { AxiosResponse } from "axios";
import { useViolationManager } from "./useViolationManager";
import type { JobApplication } from "@/type/JobApplicationSchema"; // Import JobApplication type 
import type { JobListing } from "@/type/jobListing"; // Import JobListing type 
interface PaginatedPosts {
    posts: Post[];
    currentPage: number;
    totalPages: number; 
    totalCount: number; 
}
import { InfiniteData } from '@tanstack/react-query';
import Postpage from "@/Pages/Postpage";


const usePostManager = () => { 
    const {accountId, userId, companyId, name} = useAuth(); 
    const qc = useQueryClient(); 

    // — VIOLATIONS STATE —
    const {
        allViolations,
        selectedViolations,
        setSelectedViolations,
        fetchViolations,
    } = useViolationManager();

    // you can fetch violations on mount if you like:
    useEffect(() => {
        if (accountId){
            fetchViolations(); // Fetch violations when the hook mounts
         
        }
    
    }, [accountId, fetchViolations]);


    // ✅ Move state INSIDE the hook
    const [activeFilter, setActiveFilter] = useState<string | null>(null); 
    const [activeSortBy, setActiveSortBy] = useState<string | null>(null); 

    // - which post is currently marked for deletion 
    const [postToDelete, setPostToDelete] = useState< number | null>(null); // post ID to delete, null if no post selected


    // ✅ Paginated fetching
    const {
        data,
        fetchNextPage,
        hasNextPage, 
        isFetchingNextPage,
        isLoading: isLoadingPosts, 
        refetch: refetchPosts,
        error: postsError
    } = useInfiniteQuery<PaginatedPosts, Error>({
        queryKey: ['posts', {filter: activeFilter, sort: activeSortBy}],
        
        queryFn: ({pageParam}) => 
            api.get<PaginatedPosts>('/posts/paginated', {
                params: {
                    page: pageParam,
                    pageSize: 5,
                    filterLabel: activeFilter ?? undefined, 
                    sortBy: activeSortBy ?? undefined 
                },
            }).then(res => {
                
               
                return res.data;
            }), 
        
        initialPageParam: 1,
        getNextPageParam: last => 
            last.currentPage < last.totalPages
                ? last.currentPage + 1 
                : undefined,
                 
        staleTime: 5 * 60_000,
        gcTime: 1000 * 60 * 10, 
        enabled: !!accountId, // Only run if accountId is available 
    }); 

    // ✅ Flatten all posts from all pages
    const allPosts = useMemo(() => 
        data?.pages.flatMap(page => page.posts) ?? [], 
        [data]
    );


    // -- CREATE POST MUTATION -- 
    const {
        mutateAsync: createPost,
        isPending : createPostPending,
    } = useMutation<AxiosResponse<any>, Error, CreatePostDTO>({
        mutationFn: (dto: CreatePostDTO) => { 
            return api.post("/createPost", { 
                accountId: accountId, 
                postData: {
                    title: dto.title,
                    content: dto.content,
                    labels: dto.labels 
                }
            })
        },
        onSuccess: (res) => {
            
            qc.invalidateQueries({ queryKey: ['posts'] }); // Invalidate posts cache
        }, 
    })

    // DeletePost mutation 
    const {
        mutateAsync: deletePost,
        isPending: deletePostPending, 
        isError: deletePostError, 
    } = useMutation<void, Error, DeletePostDTO>({

        mutationFn: ({ postId, violations }) => {
            return api.post(`/post/${postId}`,{
                accountId: accountId, 
                data: {violations }
            });
        },
        onSuccess: () => {
            
            qc.invalidateQueries({ queryKey: ['posts'] }); // Invalidate posts cache
            setPostToDelete(null); // Reset post to delete
            setSelectedViolations([]); // Reset selected violations 

        },
        onError: (error) => {
            console.error('Error deleting post:', error);
        }
    }
    )

    //DELETE HElPERS 
    const cancelDeletePost = () => { 
        setPostToDelete(null); // Reset post to delete
        setSelectedViolations([]); // Reset selected violations 
    } 
    
    const confirmDeletePost = () => {
    if (postToDelete == null) return;
    deletePost({
        postId: postToDelete,
        violations: selectedViolations.map((v) => v.violationId),
    });
    };

    // toggle like post 
    type ToggleLikeContext = { previousInfiniteData?: InfiniteData<PaginatedPosts> };
    const {
    mutateAsync: toggleLike,
    isPending: isTogglingLike,
    isError: toggleLikeError,
    } = useMutation<void, Error, { postId: number }, ToggleLikeContext>(
        {
            mutationFn: ({ postId }) => {
                return api.post(`/toggleLikes/${postId}/${accountId}`, {}); 
            },
            onMutate: async({postId}) => {
                await qc.cancelQueries({ queryKey: ['posts'] });

                //const previousInfiniteData = qc.getQueryData(['posts', {filter: activeFilter, sort: activeSortBy}]);
                const previousInfiniteData = qc.getQueryData<InfiniteData<PaginatedPosts>>(
                    ['posts', {filter: activeFilter, sort: activeSortBy}]
                );
                // ✅ Update infinite query data
                qc.setQueryData<InfiniteData<PaginatedPosts>>(
                    ['posts', {filter: activeFilter, sort: activeSortBy}], 
                    (old) => {
                        if (!old) return old;
                        
                        return {
                            ...old,
                            pages: old.pages.map(page => ({
                                ...page,
                                posts: page.posts.map(post => 
                                    post.id === postId 
                                        ? {
                                            ...post,
                                            likedBy: post.likedBy.includes(accountId) 
                                                ? post.likedBy.filter(id => id !== accountId)
                                                : [...post.likedBy, accountId]
                                        }
                                        : post
                                )
                            }))
                        };
                    }
                );

                return { previousInfiniteData }; // ✅ Now matches the type
            },

            onSuccess: () => {
             
                qc.invalidateQueries({ queryKey: ['posts'] }); // Invalidate posts cache
            },
            onError: (_err, _vars, context) => {
                if (context?.previousInfiniteData) { 
                    qc.setQueryData(
                        ['posts', {filter: activeFilter, sort: activeSortBy}], 
                        context.previousInfiniteData
                    ); 
                } 
            }
        }
    );

    // Hide Post (frontend thing )
    const hidePost = (postId: number) => {
        qc.setQueryData<InfiniteData<PaginatedPosts>>(
            ['posts', {filter: activeFilter, sort: activeSortBy}],
            (old) => {
                if (!old) return old;
                
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        posts: page.posts.filter(post => post.id !== postId)
                    }))
                };
            }
        );
    };


    // Create Comment mutation 
    type CommentContext = {previousData?: InfiniteData<PaginatedPosts>;};
    const {
            mutateAsync: createComment,
            isPending: isCreatingComment,
            isError: createCommentError,
        } = useMutation<void, Error, CreateCommentDTO, CommentContext>({
            mutationFn: ({ postId, content }) => {
                return api.post(`/comment/${postId}`, {
                    accountId: accountId,
                    comment: {
                        content: content, 
                        postId: postId, // ID of the post to which the comment belongs 
                    },
                }); 
            },

            onMutate: async ({ postId, content }) => {
                await qc.cancelQueries({ queryKey: ["posts", { filter: activeFilter, sort: activeSortBy }]});

                // snapshot the infinite cache
                const previousData = qc.getQueryData<InfiniteData<PaginatedPosts>>([
                    "posts",
                    { filter: activeFilter, sort: activeSortBy },
                ]);

                // optimistic patch: insert the new comment at the top of that post’s comment list
                qc.setQueryData<InfiniteData<PaginatedPosts>>(
                    ["posts", { filter: activeFilter, sort: activeSortBy }],
                    (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((p) => {
                            if (p.id !== postId) return p;
                            // create a temp comment object
                            const optimisticComment: Comment = {
                            commentId: Math.random(),           // temp ID
                            createdAt: new Date().toISOString(),
                            accountId,
                            username: name,         // from your auth context
                            content,
                            };
                            return {
                            ...p,
                            comments: [optimisticComment, ...p.comments],
                            };
                        }),
                        })),
                    };
                    }
                );

                return { previousData };
                },
            onSuccess: () => {
            
                qc.invalidateQueries({ queryKey: ['posts'] }); // Invalidate posts cache
            },
            onError: (_err, _vars, context) => { 
                if (context?.previousData) {
                    qc.setQueryData(
                        ['posts', { filter: activeFilter, sort: activeSortBy }],
                        context.previousData
                    );
                }
            }  
        })


        // Delete Comment mutation 
        type DeleteCommentContext = {
        previousData?: InfiniteData<PaginatedPosts>;
        };
        const {
            mutateAsync: deleteComment,
            isPending: isDeletingComment,
            isError: deleteCommentError,
        } = useMutation<void, Error, { commentId: number }>({
            mutationFn: ({ commentId }) => {
                return api.post(`/deleteComment/${commentId}`, {
                     accountId: accountId ,
                });
            },
            // 2️⃣ Optimistic update: remove the comment from the cache
            onMutate: async ({ commentId }) => {
                // cancel any in-flight posts queries
                await qc.cancelQueries({ queryKey: ['posts', { filter: activeFilter, sort: activeSortBy }] });

                // snapshot the current cache
                const previousData = qc.getQueryData<InfiniteData<PaginatedPosts>>([
                'posts',
                { filter: activeFilter, sort: activeSortBy },
                ]);

                // patch out the deleted comment
                qc.setQueryData<InfiniteData<PaginatedPosts>>(
                ['posts', { filter: activeFilter, sort: activeSortBy }],
                (old) => {
                    if (!old) return old;
                    return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => ({
                        ...post,
                        comments: post.comments.filter((c) => c.commentId !== commentId),
                        })),
                    })),
                    };
                }
                );

                return { previousData };
            },
            
            onSuccess: () => {
           
                qc.invalidateQueries({ queryKey: ['posts'] }); // Invalidate posts cache
            },  
        }
    )


    // ✅ Helper to add individual post to cache
    const addPostToCache = (post: Post) => {
        qc.setQueryData<InfiniteData<PaginatedPosts>>(
            ['posts', {filter: activeFilter, sort: activeSortBy}],
            (old) => {
                if (!old) {
                    return {
                        pages: [{
                            posts: [post],
                            currentPage: 1,
                            totalPages: 1,
                            totalCount: 1
                        }],
                        pageParams: [1]
                    };
                }
                
                // Check if post already exists
                const postExists = old.pages.some(page => 
                    page.posts.some(p => p.id === post.id)
                );
                
                if (postExists) return old;
                
                // Add to first page
                return {
                    ...old,
                    pages: old.pages.map((page, index) => 
                        index === 0 
                            ? {
                                ...page,
                                posts: [post, ...page.posts],
                                totalCount: page.totalCount + 1
                            }
                            : page
                    )
                };
            }
        );
    };

    // ✅ Enhanced individual post query
    const useIndividualPost = (postId: number) => {
        
        const cachedPost = allPosts.find(p => p.id === postId);
        
        const{
            data: post,
            isLoading: isLoadingPost,
            error: postError,
            refetch: refetchPost
        } = useQuery<Post, Error>({
            queryKey: ['post', postId],
            queryFn: () => {

                return api.get<Post>(`/post/${postId}`).then(res => {
                    
                    // Add to cache if not already present 
                    addPostToCache(res.data); // Add to cache 
                    return res.data;
                })
            },
            enabled: !!postId && !cachedPost,
            retry: 1,
            
            });
    

        return {
            post: cachedPost || post,
            isLoading: isLoadingPost,
            error: postError,
            refetch: refetchPost 
         }
    };


    // ✅ “Recently interacted” query
    const {
    data: recentInteractions,
    isLoading: isLoadingRecent,
    error: recentError,
    refetch: refetchRecent,
    } = useQuery<Post[], Error>({
    queryKey: ['posts', 'recently-interacted', accountId],
    queryFn: () =>
        api
        .get<Post[]>(`/RecentlyInteractedPosts/${accountId}`)
        .then((res) => res.data),
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,    // 5 minutes in cache
});


    // recently applied jobs 
    const {
        data: recentAppliedJobs,
        isLoading: isLoadingRecentJobs,
        error: recentJobsError,
        refetch: refetchRecentJobs,
    } = useQuery<JobApplication[], Error>({
        queryKey: ['JobApplication', 'recently-applied-jobs', userId],
        queryFn: () =>
            api
                .get<JobApplication[]>(`/getLatestAppliedJob/${userId}`)
                .then((res) => res.data),
        enabled: !!userId,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,    // 5 minutes in cache 
    })

    // recently posted jobs 
    const {
        data: recentPostedJobs,
        isLoading: isLoadingRecentPostedJobs,
        error: recentPostedJobsError,
        refetch: refetchRecentPostedJobs,
    } = useQuery<JobListing[], Error>({
        queryKey: ['JobListing', 'recently-posted-jobs', companyId],
        queryFn: () =>
            api
                .get<JobListing[]>(`/getLatestJobListings/${companyId}`)
                .then((res) => res.data),
        enabled: !!companyId,
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,    // 5 minutes in cache 
    })

    

    // // ✅ Console log when data changes
    // useEffect(() => {
    //     if (recentAppliedJobs) {
    //         console.log('📋 Recent Applied Jobs:', recentAppliedJobs);
    //         console.log('📊 Number of applications:', recentAppliedJobs.length);
            
    //         // Log individual jobs
    //         recentAppliedJobs.forEach((job, index) => {
    //             console.log(`Job ${index + 1}:`, job);
    //         });
    //     }
    //     if (recentPostedJobs) {
    //         console.log('📋 Recent Posted Jobs:', recentPostedJobs);
    //         console.log('📊 Number of posted jobs:', recentPostedJobs.length);
        
    //     }
    //     if (userId){ 
    //         console.log(`User ${userId} has ${recentAppliedJobs?.length ?? 0} recent applied jobs.`);
    //     }

    //     if (accountId) {
    //         console.log(`Account ${accountId} has ${recentInteractions?.length ?? 0} recent interactions.`);
    //     }

    //     if (companyId) {
    //         console.log(`Company ${companyId} has ${recentPostedJobs?.length ?? 0} recent posted jobs.`);
    //     }

    
    // }, [accountId, userId, recentInteractions, recentAppliedJobs]);



    // ✅ Return everything the component needs
    return {
        // Posts data
        allPosts,
        isLoadingPosts,
        postsError,
        
        // Pagination
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetchPosts,
        
        // Filter/Sort controls
        activeFilter,
        setActiveFilter,
        activeSortBy,
        setActiveSortBy,
        
        // Utils
        accountId,
        queryClient: qc,


        // Create post mutation 
        createPost,
        createPostPending, 

        // Post to delete 
        postToDelete, 
        setPostToDelete, 
        cancelDeletePost, 
        confirmDeletePost, 
        deletePostPending, 
        deletePostError, 

        // Toggle like mutation 
        toggleLike, 
        isTogglingLike, 
        toggleLikeError, 
        
        // Violations state 
        allViolations, 
        selectedViolations, 
        setSelectedViolations, 

        // Create comment mutation 
        createComment, 
        isCreatingComment, 
        createCommentError, 


        // Delete comment mutation 
        deleteComment, 
        isDeletingComment, 
        deleteCommentError, 

        // Hide post utility 
        hidePost, 

        // Get recently interacted posts 
        recentInteractions, 
        isLoadingRecent,
        refetchRecent,

        // Get recently applied jobs 
        recentAppliedJobs,
        isLoadingRecentJobs, 
        refetchRecentJobs, 

        //Get recently posted jobs
        recentPostedJobs, 
        isLoadingRecentPostedJobs, 
        refetchRecentPostedJobs, 

        // Individual post query 
        useIndividualPost, 
    };
}; 

export default usePostManager;