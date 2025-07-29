import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Off state - muted, clearly disabled looking
        'data-[state=unchecked]:bg-slate-600 data-[state=unchecked]:border-slate-500',
        'data-[state=unchecked]:shadow-inner',
        // On state - bright, vibrant, clearly enabled
        'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-purple-600',
        'data-[state=checked]:border-purple-400',
        'data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/25',
        // Hover effects
        'hover:data-[state=unchecked]:bg-slate-500 hover:data-[state=unchecked]:border-slate-400',
        'hover:data-[state=checked]:from-purple-400 hover:data-[state=checked]:to-purple-500',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base thumb styles
          'pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-200',
          // Off state - dark thumb that blends with off background
          'data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-slate-300 data-[state=unchecked]:shadow-sm',
          // On state - bright white thumb that pops against colored background
          'data-[state=checked]:translate-x-5 data-[state=checked]:bg-white data-[state=checked]:shadow-md',
          'data-[state=checked]:shadow-purple-900/20',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
