import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortSelect = ({ value, onChange }: SortSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-12 rounded-2xl">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectItem value="name">Nome</SelectItem>
        <SelectItem value="points">Pontos</SelectItem>
        <SelectItem value="date">Data</SelectItem>
      </SelectContent>
    </Select>
  );
};
