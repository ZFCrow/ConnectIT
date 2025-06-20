import { useState } from 'react'; 
import type { Label } from '@/type/Label'; // import the Label type 
import { useEffect } from 'react'; 
import {api} from '@/api/api'; // import the api instance 
import type { Violation } from '@/type/Violation'; // import the Violation type 

export const useViolationManager = () => {
    const [allViolations, setAllViolations] = useState<Violation[]>([]); // State to hold all violations 
    const [selectedViolations, setSelectedViolations] = useState<Violation[]>([]); // State to hold selected violations
     
    const fetchViolations = async () => {
        try {
            const response = await api.get('/violations'); // Fetch violations from the API
            console.log("Fetched violations:", response.data);
            setAllViolations(response.data); // Set the state with fetched violations
        } catch (error) {
            console.error("Error fetching violations:", error);
        }
    };

    return {
        allViolations,
        setAllViolations,
        selectedViolations,
        setSelectedViolations,
        fetchViolations, // Expose the fetch function
    }; 
}
