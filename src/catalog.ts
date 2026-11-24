import { supabase } from './supabase'

export type Product = {
  id: string
  article_number: number
  name: string
  description: string
  price: number | null
  image_path: string
  sort_order: number
  ask_fragrances: boolean
  categorySlug: string
  imageUrl: string
}


export let products: Product[] = []

type ProductRow = {
  id: string
  article_number: number
  name: string | null
  description: string | null
  price: number | null
  image_path: string
  sort_order: number
  ask_fragrances: boolean
  categories: { name: string } | null
}

export async function loadProducts(): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      article_number,
      name,
      description,
      price,
      image_path,
      sort_order,
      ask_fragrances,
      categories(name)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as unknown as ProductRow[]

  products = rows.map(row => {
    const image = supabase.storage
      .from('catalogo')
      .getPublicUrl(row.image_path)

    return {
      id: row.id,
      article_number: row.article_number,
      name: row.name || '',
      description: row.description || '',
      price: row.price,
      image_path: row.image_path,
      sort_order: row.sort_order,
      ask_fragrances: row.ask_fragrances,
      categorySlug: (row.categories?.name || '').toLowerCase(),
      imageUrl: image.data.publicUrl
    }
  })
}
