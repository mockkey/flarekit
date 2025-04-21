import type { ComponentType, ReactNode } from "react"

export type Link = ComponentType<{
    href?: string
    className?: string
    children: ReactNode
}>