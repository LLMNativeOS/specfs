import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { type SearchFilters, COMPONENTS, PATCH_TYPES } from '@/types/dataset'

interface SearchBarProps {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
  onSearch: () => void
  onClear: () => void
}

export default function SearchBar({ filters, onFilterChange, onSearch, onClear }: SearchBarProps) {
  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      handleInputChange(field, format(date, 'yyyy-MM-dd'))
    } else {
      handleInputChange(field, '')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        <Button
          variant="ghost"
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-900 h-auto p-0 hover:bg-transparent"
        >
          Clear All
        </Button>
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Keyword Search
        </label>
        <Input
          type="text"
          value={filters.keyword}
          onChange={(e) => handleInputChange('keyword', e.target.value)}
          placeholder="Search commit ID or message..."
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="focus-visible:ring-1"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal focus-visible:ring-1 hover:bg-gray-50 hover:border-gray-400 transition-colors",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(new Date(filters.startDate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => handleDateSelect('startDate', date)}
                captionLayout="dropdown"
                classNames={{
                  day_button: "hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  day_selected: "bg-gray-900 text-white hover:bg-gray-800"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            End Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal focus-visible:ring-1 hover:bg-gray-50 hover:border-gray-400 transition-colors",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(new Date(filters.endDate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => handleDateSelect('endDate', date)}
                className="rounded-md border shadow-sm"
                captionLayout="dropdown"
                classNames={{
                  day_button: "hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  day_selected: "bg-gray-900 text-white hover:bg-gray-800"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Version, Component, Patch Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Version
          </label>
          <Input
            type="text"
            value={filters.version}
            onChange={(e) => handleInputChange('version', e.target.value)}
            placeholder="e.g., 5.10"
            className="focus-visible:ring-1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Component
          </label>
          <Select
            value={filters.component}
            onValueChange={(value) => handleInputChange('component', value === "all" ? "" : value)}
          >
            <SelectTrigger className="focus-visible:ring-1 hover:bg-gray-50 hover:border-gray-400 transition-colors">
              <SelectValue placeholder="All Components" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Components</SelectItem>
              {COMPONENTS.map((comp) => (
                <SelectItem key={comp.id} value={comp.name} className="hover:bg-gray-100 cursor-pointer">
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Patch Type
          </label>
          <Select
            value={filters.patchType}
            onValueChange={(value) => handleInputChange('patchType', value === "all" ? "" : value)}
          >
            <SelectTrigger className="focus-visible:ring-1 hover:bg-gray-50 hover:border-gray-400 transition-colors">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">All Types</SelectItem>
              {PATCH_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.name} className="hover:bg-gray-100 cursor-pointer">
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File Name Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          File Name
        </label>
        <Input
          type="text"
          value={filters.fileName}
          onChange={(e) => handleInputChange('fileName', e.target.value)}
          placeholder="Search by file path..."
          className="focus-visible:ring-1"
        />
      </div>

      {/* Search Button */}
      <Button
        onClick={onSearch}
        className="w-full bg-gray-700 hover:bg-gray-800 text-white"
      >
        Search
      </Button>
    </div>
  )
}
