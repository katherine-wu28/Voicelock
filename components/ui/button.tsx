import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98]",
                gradient:
                    "bg-gradient-to-r from-primary via-accent to-primary text-white bg-[length:200%_100%] hover:bg-[100%_0] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-gradient active:scale-[0.98]",
                destructive:
                    "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-[0.98]",
                outline:
                    "border border-white/20 bg-transparent hover:bg-white/5 hover:border-white/30 text-foreground",
                secondary:
                    "bg-white/10 text-foreground hover:bg-white/15 active:scale-[0.98]",
                ghost:
                    "hover:bg-white/10 text-muted-foreground hover:text-foreground",
                glass:
                    "glass border-white/10 text-foreground hover:bg-white/10 hover:border-white/20 active:scale-[0.98]",
                link:
                    "text-primary underline-offset-4 hover:underline",
                success:
                    "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98]",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                xl: "h-14 rounded-2xl px-10 text-lg",
                icon: "h-10 w-10 rounded-full",
                "icon-sm": "h-8 w-8 rounded-full",
                "icon-lg": "h-12 w-12 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
