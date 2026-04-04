export type ProductType = "project" | "designer" | "subscription";

export interface AdConfig {
  referralLink: string;
  price: string;
  numericPrice: number;
  productName: string;
  productType: ProductType;
  ctaText: string;
  tagline: string;
}
