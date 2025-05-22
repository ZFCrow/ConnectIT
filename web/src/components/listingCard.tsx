
import type { FC } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 

interface ListingCardProps {
    title? : string; 
    listofitems? : string[];
    onClick : () => void;      
}

const ListingCard: FC<ListingCardProps> = ({title,listofitems,onClick}) => { 
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center text-lg font-bold">{title}</CardTitle> 
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                {listofitems?.map((item, index) => (
                    <button
                        key={index}
                        className="w-full text-left p-2 hover:bg-zinc-700"
                        onClick={onClick}
                    >
                        #{item}
                    </button>
                ))}
            </CardContent>
        </Card>
    )
    }
export default ListingCard; 