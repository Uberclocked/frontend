import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Props } from "./ComponentSelector.types";


function ComponentSelector({ components, onSelect }: Props) {
  return (
    <div className="
        flex flex-wrap flex-1
        gap-4 p-4
        border-2 rounded-xl
        overflow-y-scroll
        ">
      {components.map((component) => (
        <Card
          key={component.id}
          className="h-[calc(50%-0.5rem)] w-[calc(50%-0.5rem)]"
          onClick={() => onSelect(component.sku_prefix)}
        >
          <CardHeader>
            <CardTitle>
              {component.display_name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export default ComponentSelector;
