// Define valid colors as a type union
export type ValidColor = 'red' | 'blue' | 'green' | 'gray' | 'purple' | 'pink' | 'orange' | 'yellow' | 'lime';

export type Label ={
    name: string;
    color: ValidColor; 
}