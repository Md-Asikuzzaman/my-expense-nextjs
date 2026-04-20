import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white shadow-md shadow-[#DC2626]/20 hover:shadow-lg hover:shadow-[#DC2626]/30 hover:brightness-110 active:brightness-95',
        outline:
          'border-border/60 bg-background/80 hover:border-[#DC2626]/50 hover:bg-[#DC2626]/5 aria-expanded:bg-muted aria-expanded:text-foreground dark:border-border/40 dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-[#0891B2]/10 text-[#0891B2] hover:bg-[#0891B2]/20 aria-expanded:bg-[#0891B2]/20 active:bg-[#0891B2]/30',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30',
        link: 'text-[#DC2626] underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 touch-manipulation',
        xs: "h-8 gap-1.5 rounded-md px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 touch-manipulation",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4 touch-manipulation",
        lg: 'h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 touch-manipulation',
        icon: 'size-11 touch-manipulation',
        'icon-xs':
          "size-9 rounded-md in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4 touch-manipulation",
        'icon-sm':
          "size-10 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4 touch-manipulation",
        'icon-lg':
          "size-12 [&_svg:not([class*='size-'])]:size-5 touch-manipulation",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
