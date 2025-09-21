import { Label } from "@/components/ui/label";

export const FieldLabel = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) => (
  <Label htmlFor={htmlFor} className="pt-3 sm:justify-self-end sm:text-right">
    {children}
  </Label>
);
