import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useSitesStore from '@/hooks/use-sites-store';
import type { MonitoredSite } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(1, { message: 'Website name is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
  maintainer: z.string().optional(),
  domainExpiry: z.date().optional(),
});
interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteToEdit?: MonitoredSite | null;
}
export function AddSiteDialog({ open, onOpenChange, siteToEdit }: AddSiteDialogProps) {
  const addSite = useSitesStore((s) => s.addSite);
  const updateSite = useSitesStore((s) => s.updateSite);
  const isEditMode = !!siteToEdit;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      maintainer: '',
    },
  });
  useEffect(() => {
    if (siteToEdit && open) {
      form.reset({
        name: siteToEdit.name,
        url: siteToEdit.url,
        maintainer: siteToEdit.maintainer || '',
        domainExpiry: siteToEdit.domainExpiry ? new Date(siteToEdit.domainExpiry) : undefined,
      });
    } else if (!open) {
      form.reset({
        name: '',
        url: '',
        maintainer: '',
        domainExpiry: undefined,
      });
    }
  }, [siteToEdit, open, form]);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      domainExpiry: values.domainExpiry ? values.domainExpiry.toISOString() : undefined,
    };
    if (isEditMode && siteToEdit) {
      await updateSite(siteToEdit.id, payload);
    } else {
      await addSite(payload);
    }
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Site Details' : 'Add a new site to monitor'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the details for ${siteToEdit.name}.`
              : "Enter the details of the site you want to track. We'll start monitoring it immediately."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://cloudflare.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maintainer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is Maintaining</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe, DevOps Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domainExpiry"
              render={({ field }) => {
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
              }}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Site')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}