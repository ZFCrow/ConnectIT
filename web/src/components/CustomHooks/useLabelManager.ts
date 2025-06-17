import { useState } from 'react'; 
import type { Label } from '@/type/Label'; // import the Label type 
import { useEffect } from 'react'; 
import {api} from '@/api/api'; // import the api instance 

export const useLabelManager = () => {
   
    const [allLabels, setAllLabels] = useState<Label[]>([]);
    const [popularLabels, setPopularLabels] = useState<Label[]>([]); // Popular labels for quick access 
    
    // ? i dont think its used anywhere 
    const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);


    const fetchLabels = async () => {
        try {
            const response = await api.get('/labels');
            console.log("Fetched labels:", response.data);
            setAllLabels(response.data); // set the all labels state with the fetched labels
            //figure out the popular labels based on number of uses 
            const sortedLabels = response.data.sort((a: Label, b: Label) => (b.numberofUses || 0) - (a.numberofUses || 0));
            const topLabels = sortedLabels.slice(0, 5); // Get the top 5 labels 
            setPopularLabels(topLabels); // set the popular labels state with the top 5 labels
            console.log("Popular labels:", topLabels);
        } catch (error) {
            console.error("Error fetching labels:", error);
        }


    }; 

    return {
        allLabels,
        setAllLabels,
        popularLabels,
        setPopularLabels,
        selectedLabels,
        setSelectedLabels,
        fetchLabels, // expose the fetch function
    }
  
}
