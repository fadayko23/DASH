export function renderEmailTemplate(templateBody: string, data: Record<string, any>): string {
  let rendered = templateBody;
  
  for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      // Global replacement
      rendered = rendered.split(placeholder).join(String(value || ''));
  }
  
  return rendered;
}
