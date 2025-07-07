import { useState, useCallback } from 'react'; 
import {api} from '@/api/api'; // import the api instance 
import type { Violation } from '@/type/Violation'; // import the Violation type 

export const useViolationManager = () => {
    const [allViolations, setAllViolations] = useState<Violation[]>([]); // State to hold all violations 
    const [selectedViolations, setSelectedViolations] = useState<Violation[]>([]); // State to hold selected violations
     

      const fetchViolations = useCallback(async () => {
    try {
      const response = await api.get("/violations");
      setAllViolations(response.data);
    } catch (error) {
      console.error("Error fetching violations:", error);
    }
  }, []); // <-- empty deps means the function reference never changes

    return {
        allViolations,
        setAllViolations,
        selectedViolations,
        setSelectedViolations,
        fetchViolations, // Expose the fetch function
    }; 
}
