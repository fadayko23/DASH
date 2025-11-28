'use client'

import { useState } from 'react'
import { updateTheme } from '../actions'

type Theme = {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    bgColor: string
    textColor: string
    fontFamily: string
    borderRadius: string
}

export default function ThemeForm({ initialTheme }: { initialTheme: Theme }) {
    const [theme, setTheme] = useState(initialTheme)

    const handleChange = (key: keyof Theme, value: string) => {
        setTheme(prev => ({ ...prev, [key]: value }))
    }

    return (
        <form action={updateTheme} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Primary Color */}
                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">Primary Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={theme.primaryColor}
                            onChange={e => handleChange('primaryColor', e.target.value)}
                            className="h-9 w-9 rounded border cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            name="primaryColor" 
                            value={theme.primaryColor} 
                            onChange={e => handleChange('primaryColor', e.target.value)}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                    </div>
                </div>

                {/* Secondary Color */}
                <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">Secondary Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={theme.secondaryColor}
                            onChange={e => handleChange('secondaryColor', e.target.value)}
                            className="h-9 w-9 rounded border cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            name="secondaryColor" 
                            value={theme.secondaryColor} 
                            onChange={e => handleChange('secondaryColor', e.target.value)}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                    </div>
                </div>

                {/* Accent Color */}
                <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium mb-1">Accent Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={theme.accentColor}
                            onChange={e => handleChange('accentColor', e.target.value)}
                            className="h-9 w-9 rounded border cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            name="accentColor" 
                            value={theme.accentColor} 
                            onChange={e => handleChange('accentColor', e.target.value)}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                    </div>
                </div>

                {/* Background Color */}
                <div>
                    <label htmlFor="bgColor" className="block text-sm font-medium mb-1">Background Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={theme.bgColor}
                            onChange={e => handleChange('bgColor', e.target.value)}
                            className="h-9 w-9 rounded border cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            name="bgColor" 
                            value={theme.bgColor} 
                            onChange={e => handleChange('bgColor', e.target.value)}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                    </div>
                </div>

                {/* Text Color */}
                <div>
                    <label htmlFor="textColor" className="block text-sm font-medium mb-1">Text Color</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={theme.textColor}
                            onChange={e => handleChange('textColor', e.target.value)}
                            className="h-9 w-9 rounded border cursor-pointer" 
                        />
                        <input 
                            type="text" 
                            name="textColor" 
                            value={theme.textColor} 
                            onChange={e => handleChange('textColor', e.target.value)}
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm" 
                        />
                    </div>
                </div>

                {/* Font Family */}
                <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium mb-1">Font Family</label>
                    <select 
                        name="fontFamily" 
                        value={theme.fontFamily} 
                        onChange={e => handleChange('fontFamily', e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                        <option value="Montserrat">Montserrat</option>
                        <option value="sans-serif">System Sans</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Monospace</option>
                    </select>
                </div>

                {/* Border Radius */}
                <div>
                    <label htmlFor="borderRadius" className="block text-sm font-medium mb-1">Border Radius</label>
                    <select 
                        name="borderRadius" 
                        value={theme.borderRadius} 
                        onChange={e => handleChange('borderRadius', e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                        <option value="0rem">None</option>
                        <option value="0.25rem">Small</option>
                        <option value="0.5rem">Medium</option>
                        <option value="0.75rem">Large</option>
                        <option value="1rem">Extra Large</option>
                    </select>
                </div>
            </div>

            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                Save Theme
            </button>
        </form>
    )
}

