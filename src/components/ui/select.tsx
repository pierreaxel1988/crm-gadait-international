
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 font-futura",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  searchable?: boolean;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", searchable = true, ...props }, ref) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Filter children based on search query
  const filteredChildren = React.useMemo(() => {
    if (!searchQuery || !searchable) return children;
    
    // Special case for USA/United States search
    const isUsSearch = searchQuery.toLowerCase().includes('us') || 
                      searchQuery.toLowerCase().includes('usa') || 
                      searchQuery.toLowerCase().includes('etats') || 
                      searchQuery.toLowerCase().includes('états') || 
                      searchQuery.toLowerCase().includes('unis');
    
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      
      // Handle SelectGroup specifically
      if (child.type === SelectGroup) {
        const filteredGroupChildren = React.Children.toArray(child.props.children).filter((groupChild) => {
          if (!React.isValidElement(groupChild)) return false;
          
          const itemText = groupChild.props.children?.toString().toLowerCase() || '';
          // Special handling for USA variants
          if (isUsSearch && (itemText.includes('usa') || 
                             itemText.includes('united states') || 
                             itemText.includes('états-unis') || 
                             itemText.includes('etats-unis'))) {
            return true;
          }
          
          // Normalize text for accent-insensitive search
          const normalizedItemText = itemText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const normalizedSearchQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return normalizedItemText.includes(normalizedSearchQuery);
        });
        
        if (filteredGroupChildren.length === 0) return null;
        return React.cloneElement(child, { ...child.props, children: filteredGroupChildren });
      }
      
      // Handle SelectItem
      if (child.type === SelectItem || child.props.className?.includes('dropdown-menu-item')) {
        const itemText = child.props.children?.toString().toLowerCase() || '';
        
        // Special handling for USA variants
        if (isUsSearch && (itemText.includes('usa') || 
                           itemText.includes('united states') || 
                           itemText.includes('états-unis') || 
                           itemText.includes('etats-unis'))) {
          return child;
        }
        
        // Normalize text for accent-insensitive search
        const normalizedItemText = itemText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedSearchQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedItemText.includes(normalizedSearchQuery) ? child : null;
      }
      
      return child;
    }).filter(Boolean);
  }, [children, searchQuery, searchable]);
  
  // Handle keyboard navigation for filtering
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchable) return;
    
    // Allow keyboard navigation with up/down arrows
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return;
    }
    
    // Clear on escape or backspace if empty
    if (e.key === 'Escape') {
      setSearchQuery("");
      return;
    }
    
    if (e.key === 'Backspace') {
      setSearchQuery(prev => prev.slice(0, -1));
      return;
    }
    
    // Only add printable characters (a-z, A-Z, 0-9, etc.)
    if (e.key.length === 1) {
      setSearchQuery(prev => prev + e.key);
      e.preventDefault(); // Prevent default to avoid triggering selection
    }
  };
  
  React.useEffect(() => {
    // Auto-clear search after 2 seconds of inactivity
    const timer = setTimeout(() => {
      if (searchQuery) setSearchQuery("");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dropdown-menu-content",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {searchable && searchQuery && (
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-muted">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-futura">{searchQuery}</span>
          </div>
        )}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-transparent",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
          style={{
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {filteredChildren}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-futura", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dropdown-menu-item font-futura",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
