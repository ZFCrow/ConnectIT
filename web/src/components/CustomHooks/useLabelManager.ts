import { useState, useCallback } from 'react'; 
import type { Label } from '@/type/Label'; // import the Label type 
import { useEffect } from 'react'; 
import {api} from '@/api/api'; // import the api instance 

export const useLabelManager = () => {
   
    const [allLabels, setAllLabels] = useState<Label[]>([]);
    const [popularLabels, setPopularLabels] = useState<Label[]>([]); // Popular labels for quick access 
    
    // ? i dont think its used anywhere 
    // const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);

    const [loading, setLoading] = useState<boolean>(false); // Loading state for fetching labels

    const fetchLabels = useCallback(async () => {
        setLoading(true); // Set loading to true when fetching starts 
        try {
            const response = await api.get('/labels');
            setAllLabels(response.data); // set the all labels state with the fetched labels

            //figure out the popular labels based on number of uses 
            const sortedLabels = response.data.sort((a: Label, b: Label) => (b.numberofUses || 0) - (a.numberofUses || 0));
            const topLabels = sortedLabels.slice(0, 5); // Get the top 5 labels 
            setPopularLabels(topLabels); // set the popular labels state with the top 5 labels
        } catch (error) {
            console.error("Error fetching labels:", error);
        } finally {
            setLoading(false); // Set loading to false when fetching ends 
        }
    }, []); // Empty dependency array to ensure this function is stable and does not change on every render 

    return {
        allLabels,
        setAllLabels,
        popularLabels,
        setPopularLabels,
        loading,
        setLoading, 
        fetchLabels, // expose the fetch function
    }
  
}
