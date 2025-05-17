import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
  interface ItemsPerPageProps {
    value: number
    onChange: (value: number) => void
    options?: number[]
  }
  
  export function ItemsPerPage({
    value,
    onChange,
    options = [10, 25, 50, 100],
  }: ItemsPerPageProps) {
    return (
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">Itens por página</p>
        <Select
          value={value.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue placeholder={value.toString()} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }