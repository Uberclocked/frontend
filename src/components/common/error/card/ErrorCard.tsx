import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Props } from "./ErrorCars.types";
import { CircleX } from "lucide-react";

function ErrorCard({ status, statusText }: Props) {
  return (
    <Card className="flex flex-col justify-evenly items-center w-1/4 bg-white">
      <CardHeader className="flex flex-col justify-evenly items-center">
        <CircleX size={108} color="#ff0000" strokeWidth={3} absoluteStrokeWidth />
        <CardTitle className="text-2xl">
          {status}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-evenly items-center text-xl">
        {statusText}
      </CardContent>
    </Card>
  )
}

export default ErrorCard;
