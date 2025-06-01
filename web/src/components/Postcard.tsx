import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { Badge } from "@/components/ui/badge";
import type { FC } from "react";
import { useState } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  Trash2,
  MessageSquare,
  ThumbsUp,
  MoreVertical,
  Flag,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";

import { Role, useAuth } from "@/contexts/AuthContext";

import type { Post } from "@/type/Post";
import type { ValidColor } from "@/type/Label";

type PostcardProps = Post & {
  detailMode?: boolean; // ✅ optional, with default = false
  onReport?: () => void; // Optional callback for report action
  onHide?: (postId: number) => void; // Optional callback for hide action
  onDelete?: (postId: number) => void; // Add delete callback
  onDeleteComment?: (commentId: number) => void; // Optional callback for deleting a comment
};

const Postcard: FC<PostcardProps> = ({
  accountId: postAccountId,
  id,
  user,
  date,
  labels,
  title,
  content,
  comments,
  likes,
  liked,
  detailMode,
  onHide,
  onDelete,
  onDeleteComment,
}) => {
  const colorMap: Record<ValidColor, string> = {
    red: "border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    blue: "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
    green:
      "border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
    gray: "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white",
    purple:
      "border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white",
    pink: "border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white",
    orange:
      "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white",
    yellow:
      "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white",
    lime: "border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-white",
  };

  const { accountId, role } = useAuth(); // Get the current user's account ID from context

  const navigate = useNavigate();
  const interactiveClasses = detailMode
    ? "flex-grow"
    : "hover:!shadow-lg cursor-pointer transition-shadow duration-200 ease-in-out hover:bg-muted";
  const [hasLiked, setHasLiked] = useState(liked || false); // Initialize liked state, default to false if not provided
  return (
    <>
      <Card
        {...(detailMode ? {} : { onClick: () => navigate(`/post/${id}`) })}
        className={`${interactiveClasses}`}
      >
        <CardHeader>
          <div className="flex flex-col gap-3">
            {/* row section with the avatar, posttitle with the dropdown at the other side */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user}`}
                  />
                  <AvatarFallback>{user[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-muted-foreground flex flex-col items-start gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      @{user}
                    </span>
                    {/* Date on its own line */}
                    <span className="text-xs">{date}</span>
                  </CardDescription>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>

                  {/* The pop-up menu */}
                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    className="w-40"
                  >
                    {/* <DropdownMenuItem onSelect={() => console.log("report")}>
                                    <Flag/>Report
                                    </DropdownMenuItem>  */}

                    {onDelete &&
                      (role === Role.Admin || accountId === postAccountId) && (
                        <DropdownMenuItem
                          onSelect={() => {
                            onDelete(id);
                          }}
                        >
                          <Trash2 className="text-red-500" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    {onHide && (
                      <DropdownMenuItem
                        onSelect={() => {
                          onHide(id);
                        }}
                      >
                        <EyeOff />
                        Hide
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* badges section right under the postTitle and avatar  */}
            <div>
              {labels.map((label, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={`
                                px-2 py-1
                                text-sm
                                rounded-full                                
                                transition-colors duration-200
                                ${colorMap[label.color] || colorMap.gray}
                                 `}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-relaxed">{content}</p>
        </CardContent>

        <CardFooter className="flex flex-col">
          <Collapsible className="w-full" defaultOpen={detailMode}>
            <div className="flex flex-col items-end gap-1 mt-2">
              {/* Optional likes message */}
              {likes > 0 && (
                <div className="flex items-center space-x-2 text-blue-500 text-sm">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{likes} others have liked this</span>
                </div>
              )}

              {/* Buttons in a row */}
              <div className="flex items-center space-x-4 text-sm text-slate-200">
                {role != Role.Admin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center transition-all duration-150  hover:scale-105
                                            ${
                                              hasLiked
                                                ? "text-red-500 hover:bg-red-100/20 hover:text-red-500"
                                                : "hover:bg-accent"
                                            } 
                                        `}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      console.log("Liked!");
                      setHasLiked(!hasLiked); // Toggle liked state
                    }}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    Like
                  </Button>
                )}

                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center transition-all duration-150 hover:bg-accent hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      console.log("comment clicked!");
                    }}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Comments ({comments.length})
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent className="space-y-3 pt-2">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group align-items"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.user}`}
                    />
                    <AvatarFallback className="text-xs">
                      {c.user[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between ">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{c.user}</span>
                        <span className="text-xs text-muted-foreground">
                          2h ago
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {c.content}
                    </p>
                  </div>

                  {/* Show delete button for admins or comment owner */}
                  {onDeleteComment &&
                    (role === Role.Admin || c.accountId === accountId) && (
                      <Button
                        variant="ghost"
                        size="lg"
                        className="
                                                opacity-0 group-hover:opacity-100 
                                                transition-opacity duration-200 
                                                text-red-500 hover:text-red-700 
                                                p-1 rounded
                                                border-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteComment(c.commentId); // Call the delete comment callback
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              ))}

              {/* optional add-comment UI */}

              {role !== Role.Admin && (
                <div className="flex space-x-2 pt-2">
                  <input
                    className="flex-1 rounded border px-2 py-1"
                    placeholder="Add a comment…"
                  />
                  <Button size="sm">Post</Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </>
  );
};

export default Postcard;
