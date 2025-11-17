import { useState, useEffect } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formSchema } from './AddSiteDialog';
type FormSchemaType = z.infer<typeof formSchema>;
interface DomainExpiryInputProps {
  field: ControllerRenderProps<FormSchemaType, "domainExpiry">;
}
export function DomainExpiryInput({ field }: DomainExpiryInputProps) {
  const [inputValue, setInputValue] = useState(field.value ? format(field.value, 'yyyy-MM-dd') : '');
  useEffect(() => {
    setInputValue(field.value ? format(field.value, 'yyyy-MM-dd') : '');
  }, [field.value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      field.onChange(parsedDate);
    } else if (value === '') {
      field.onChange(undefined);
    }
  };
  return (
    <FormItem className="flex flex-col">
      <FormLabel>Domain Expiry Date</FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            placeholder="YYYY-MM-DD"
            value={inputValue}
            onChange={handleInputChange}
          />
        </FormControl>
        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  setInputValue(date ? format(date, 'yyyy-MM-dd') : '');
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}