import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // El anillo de foco va en 4px, como pide `buttons.md`, contra los 3px que
  // traía shadcn. `relative` está acá y no en cada tamaño porque todos los
  // tamaños por debajo de 44px usan un `::after` para llegar al mínimo táctil.
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap shadow-xs transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-strong)] outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // El hover se asienta en el terracota más profundo, no en uno más claro.
        // `bg-primary/80` sobre la crema aclaraba el relleno y tiraba el
        // contraste de la etiqueta blanca por debajo de AA.
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_15%)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        // `buttons.md` es explícito: ghost va sin sombra.
        ghost:
          "shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "shadow-none text-primary underline underline-offset-[3px] hover:no-underline",
      },
      // Escala de `buttons.md`, subida desde la compacta que traía shadcn
      // (h-6/h-7/h-8/h-9). Ningún tamaño lleva `rounded-*`: el sistema da 16px
      // a *todo* botón, sea del tamaño que sea, y los 8px quedan para badges y
      // tooltips.
      //
      // El `after:` estira el área tocable hasta los 44px sin agrandar la caja
      // visual: la escala de Terracotta solo alcanza esa altura en el tamaño
      // grande, así que engordar el botón rompería el sistema. Misma técnica que
      // ya usan el checkbox y el radio de este proyecto. Crece solo en vertical,
      // para que dos botones vecinos en una fila no se solapen.
      size: {
        default:
          "h-10 gap-2 px-[18px] text-[15px] after:absolute after:inset-x-0 after:-inset-y-0.5 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-8 gap-1 px-3 text-xs after:absolute after:inset-x-0 after:-inset-y-2 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 gap-1.5 px-3.5 text-sm after:absolute after:inset-x-0 after:-inset-y-0.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-[22px] text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs": "size-8 after:absolute after:-inset-2 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 after:absolute after:-inset-0.5",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
