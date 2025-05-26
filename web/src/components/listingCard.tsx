
    import type { FC } from 'react';

    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 

   
    import { Button } from '@/components/ui/button';
    import { useState } from 'react';

    interface ListingCardProps {
        title? : string; 
        listofitems? : string[];
        onClick : (criterion:string) => void;  
        onClickReset : (type: 'filter'   | 'sort') => void; // function to reset the filter or sort 
        type: 'filter' | 'sort'; // type of the listing card, either filter or sort 
    }

    const ListingCard: FC<ListingCardProps> = ({title,listofitems,onClick, onClickReset, type}) => { 
        const [selected, setSelected] = useState<string | null>(null);
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-lg font-bold">{title}</CardTitle> 
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    {listofitems?.map((item, index) => (
                        <Button
                            variant="ghost"
                            key={index}
                            className={ `${selected == item? 'hover:bg-red-100/20 hover:text-red-500 !text-red-500':'' } w-full text-left p-2 hover:bg-zinc-700 rounded-md cursor-pointer`}
                            onClick={() => {
                                setSelected(item);
                                onClick(item)}
                            }
                        >
                            #{item}
                        </Button> 
                            
                       
                    ))}
                    <Button 
                        variant="ghost"
                        onClick={() => {
                            onClickReset(type)
                            setSelected(null)}}> reset</Button>
                </CardContent>
            </Card>
        )
        }
    export default ListingCard; 