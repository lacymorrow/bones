import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import type React from "react";
export interface AccordionItemType {
  title: string;
  content: React.ReactNode;
}

interface AccordionListProps {
  items: AccordionItemType[];
  accordionProps?: React.ComponentProps<typeof Accordion>;
}

export const AccordionList: React.FC<AccordionListProps> = ({
  items,
  accordionProps,
}) => {
  return (
    <Accordion type="single" collapsible {...accordionProps}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`} className="">
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>
            <div className="px-sm">
              <Separator />
            </div>
            <p className="pt-md">{item.content}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
