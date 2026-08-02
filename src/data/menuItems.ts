// Catalogue produits SARA — source unique, partagée par la page Menu et,
// plus tard, le panier / la commande / Stripe. Ne pas dupliquer ces données
// ailleurs (c'est justement le piège que ce fichier existe pour éviter).
//
// ⚠️ Contenu encore PLACEHOLDER (prix, descriptions, catégories) — à
// remplacer par la vraie carte du patron avant mise en ligne.

export type MenuCategoryId =
  | "kebabs"
  | "burgers"
  | "tacos"
  | "assiettes"
  | "menus"
  | "boissons"
  | "desserts";

export type MenuCategory = {
  id: MenuCategoryId;
  label: string;
  image: string | null;
  emoji: string;
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategoryId;
  price: number;
  image: string | null;
  emoji: string;
  desc: string;
};

const IMG = {
  durum: "/img/durum.jpg",
  tacosAlt: "/img/tacos-alt.jpg",
  burger: "/img/burger.jpg",
  burgerAlt: "/img/burger-alt.jpg",
  tacos: "/img/tacos.jpg",
  assiette: "/img/assiette.jpg",
  assietteAlt: "/img/assiette-alt.jpg",
  plate: "/img/plate.jpg",
  drink: "/img/drink.jpg",
};

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "kebabs", label: "Kebabs", image: IMG.durum, emoji: "🌯" },
  { id: "burgers", label: "Burgers", image: IMG.burger, emoji: "🍔" },
  { id: "tacos", label: "Tacos", image: IMG.tacos, emoji: "🌮" },
  { id: "assiettes", label: "Assiettes", image: IMG.assiette, emoji: "🍽️" },
  { id: "menus", label: "Menus", image: IMG.plate, emoji: "🥡" },
  { id: "boissons", label: "Boissons", image: IMG.drink, emoji: "🥤" },
  { id: "desserts", label: "Desserts", image: null, emoji: "🍰" },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "kebab", category: "kebabs", name: "Kebab Classique", price: 8.5, image: IMG.durum, emoji: "🌯", desc: "Pain pita, viande grillée, crudités fraîches et sauce blanche maison." },
  { id: "durum", category: "kebabs", name: "Durum Poulet", price: 9, image: IMG.tacosAlt, emoji: "🌯", desc: "Galette roulée grillée, poulet mariné, frites et sauce samouraï." },
  { id: "double", category: "burgers", name: "Double Cheeseburger", price: 10.5, image: IMG.burger, emoji: "🍔", desc: "Deux steaks, cheddar fondu, bacon croustillant et sauce maison." },
  { id: "sara", category: "burgers", name: "Burger Sara", price: 9.5, image: IMG.burgerAlt, emoji: "🍔", desc: "Steak 150g, cheddar, oignons confits et sauce signature Sara." },
  { id: "tacosxl", category: "tacos", name: "Tacos XL", price: 9, image: IMG.tacos, emoji: "🌮", desc: "Galette grillée, viande au choix, frites et sauce fromagère onctueuse." },
  { id: "mixte", category: "assiettes", name: "Assiette Mixte", price: 13.5, image: IMG.assietteAlt, emoji: "🍽️", desc: "Brochettes de poulet et bœuf, riz safran, frites, salade et sauces." },
  { id: "poulet", category: "assiettes", name: "Assiette Poulet", price: 11.5, image: IMG.assietteAlt, emoji: "🍽️", desc: "Émincé de poulet grillé, frites maison, crudités et sauce blanche." },
  { id: "etudiant", category: "menus", name: "Menu Étudiant", price: 9.9, image: IMG.plate, emoji: "🥡", desc: "Kebab + frites + boisson au choix. Le meilleur rapport qualité-prix." },
  { id: "soda", category: "boissons", name: "Boisson 33cl", price: 2.5, image: IMG.drink, emoji: "🥤", desc: "Coca, Fanta, Sprite, eau plate ou pétillante au choix." },
  { id: "baklava", category: "desserts", name: "Assortiment Baklava", price: 4.5, image: null, emoji: "🍰", desc: "Pâtisseries orientales au miel et pistaches, fait maison." },
];

export function categoryLabel(id: MenuCategoryId): string {
  return MENU_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function itemsByCategory(id: MenuCategoryId): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.category === id);
}

export function findMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}

// Même format que Flash Pizzas ("20.- CHF" si entier, "9.90 CHF" sinon).
export function formatChf(price: number): string {
  const rounded = Math.round(price * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}.- CHF` : `${rounded.toFixed(2)} CHF`;
}
