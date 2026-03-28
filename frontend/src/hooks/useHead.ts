import { useEffect } from 'react'

interface UseHeadOptions {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  canonical?: string
}

function setMetaTag(property: string, content: string, useProperty = false): void {
  const attr = useProperty ? 'property' : 'name'
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function useHead({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonical,
}: UseHeadOptions): void {
  useEffect(() => {
    // Set title
    document.title = title

    // Standard meta tags
    setMetaTag('description', description)

    // Open Graph tags
    setMetaTag('og:title', title, true)
    setMetaTag('og:description', description, true)
    setMetaTag('og:type', ogType, true)
    setMetaTag('og:site_name', 'NotesHub Kashmir', true)

    if (ogImage) {
      setMetaTag('og:image', ogImage, true)
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)

    if (ogImage) {
      setMetaTag('twitter:image', ogImage)
    }

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical)
    }
  }, [title, description, ogImage, ogType, canonical])
}
