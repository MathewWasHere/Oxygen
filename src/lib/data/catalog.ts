import type { Category, Coupon, DeliveryZone, Product } from "@/lib/types";

/**
 * OXYGEN catalog — built from the 41 supplied menu photographs.
 *
 * Every product image is available in two optimized WebP sizes:
 *   /food/<slug>.webp      800×800
 *   /food/<slug>-sm.webp   400×400
 *
 * Prices and opening hours are explicitly hypothetical placeholders until the
 * restaurant supplies its final commercial information.
 */

export const RESTAURANT = {
  name: "فست فود اکسیژن",
  nameLatin: "OXYGEN",
  tagline: "هر لقمه، یک نفس تازه",
  phone: "+987153340472",
  phoneDisplay: "۰۷۱-۵۳۳۴۰۴۷۲",
  address: "فسا، ابتدای فاز ۴، نرسیده به مجتمع گلشهر",
  city: "فسا",
  province: "فارس",
  lat: 28.9505657,
  lng: 53.6252939,
  mapUrl: "https://maps.app.goo.gl/qtRmApR5TeDQTy6z8",
  hours: "همه‌روزه ۱۱:۰۰ تا ۰۱:۰۰ بامداد",
  openFrom: 11,
  openTo: 1,
  instagram: "https://www.instagram.com/fastfoodoxygen/",
} as const;

export const categories: Category[] = [
  { id: "c1", slug: "pizza", name: "پیتزا", image: "/food/pizza-oxygen-23-sm.webp", sortOrder: 1, active: true },
  { id: "c2", slug: "burger", name: "برگر", image: "/food/burger-90-sm.webp", sortOrder: 2, active: true },
  { id: "c3", slug: "sandwich", name: "ساندویچ", image: "/food/bomb-sandwich-sm.webp", sortOrder: 3, active: true },
  { id: "c4", slug: "snack", name: "اسنک", image: "/food/snack-special-sm.webp", sortOrder: 4, active: true },
  { id: "c5", slug: "fried", name: "سوخاری", image: "/food/fried-chicken-fillet-4-sm.webp", sortOrder: 5, active: true },
  { id: "c6", slug: "sides", name: "پیش‌غذا", image: "/food/fries-cheese-mushroom-sm.webp", sortOrder: 6, active: true },
  { id: "c7", slug: "pasta", name: "پاستا", image: "/food/pasta-penne-sm.webp", sortOrder: 7, active: true },
  { id: "c8", slug: "salad", name: "سالاد", image: "/food/caesar-salad-fried-chicken-sm.webp", sortOrder: 8, active: true },
  { id: "c9", slug: "drinks", name: "نوشیدنی", image: "/food/lemonade-family-sm.webp", sortOrder: 9, active: true },
];

type ProductSeed = {
  slug: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  ingredients: string[];
  prepMinutes: number;
  popular?: boolean;
};

const productSeeds: ProductSeed[] = [
  // پیتزا — names and sizes follow the supplied filenames.
  { slug: "pizza-four-season-28", categoryId: "c1", name: "پیتزا چهارفصل آمریکایی دونفره (۲۸ سانتی‌متر)", shortDescription: "چهار طعم متنوع در یک پیتزای آمریکایی دونفره", ingredients: ["خمیر آمریکایی", "پنیر پیتزا", "ترکیب چهارفصل"], prepMinutes: 22, popular: true },
  { slug: "pizza-four-season-32", categoryId: "c1", name: "پیتزا چهارفصل آمریکایی (۳۲ سانتی‌متر)", shortDescription: "پیتزای بزرگ چهارفصل با چهار ترکیب متفاوت", ingredients: ["خمیر آمریکایی", "پنیر پیتزا", "ترکیب چهارفصل"], prepMinutes: 24 },
  { slug: "pizza-oxygen-23", categoryId: "c1", name: "پیتزا اکسیژن آمریکایی (۲۳ سانتی‌متر)", shortDescription: "ترکیب ویژه اکسیژن روی خمیر آمریکایی تازه", ingredients: ["خمیر آمریکایی", "پنیر پیتزا", "ترکیب ویژه اکسیژن"], prepMinutes: 20, popular: true },
  { slug: "pizza-roast-beef-23", categoryId: "c1", name: "پیتزا رست‌بیف آمریکایی (۲۳ سانتی‌متر)", shortDescription: "رست‌بیف، قارچ و پنیر پیتزا روی خمیر آمریکایی", ingredients: ["رست‌بیف", "قارچ", "پنیر پیتزا"], prepMinutes: 22 },
  { slug: "pizza-vegetables-23", categoryId: "c1", name: "پیتزا سبزیجات آمریکایی (۲۳ سانتی‌متر)", shortDescription: "ترکیب رنگارنگ سبزیجات، قارچ و پنیر پیتزا", ingredients: ["سبزیجات", "قارچ", "پنیر پیتزا"], prepMinutes: 20 },
  { slug: "pizza-special-25", categoryId: "c1", name: "پیتزا مخصوص آمریکایی (۲۵ سانتی‌متر)", shortDescription: "پیتزای مخصوص با تاپینگ کامل و پنیر فراوان", ingredients: ["خمیر آمریکایی", "ترکیب مخصوص", "پنیر پیتزا"], prepMinutes: 22 },
  { slug: "pizza-special-28", categoryId: "c1", name: "پیتزا مخصوص آمریکایی دونفره (۲۸ سانتی‌متر)", shortDescription: "نسخه دونفره پیتزای مخصوص با تاپینگ کامل", ingredients: ["خمیر آمریکایی", "ترکیب مخصوص", "پنیر پیتزا"], prepMinutes: 24, popular: true },
  { slug: "pizza-mixed-32", categoryId: "c1", name: "پیتزا مخلوط آمریکایی (۳۲ سانتی‌متر)", shortDescription: "پیتزای بزرگ مخلوط با قارچ، فلفل و پنیر", ingredients: ["خمیر آمریکایی", "ترکیب مخلوط", "پنیر پیتزا"], prepMinutes: 24 },
  { slug: "pizza-chicken-mushroom-23", categoryId: "c1", name: "پیتزا مرغ و قارچ آمریکایی (۲۳ سانتی‌متر)", shortDescription: "مرغ مزه‌دار، قارچ تازه و پنیر پیتزا", ingredients: ["مرغ", "قارچ", "پنیر پیتزا"], prepMinutes: 21 },
  { slug: "pizza-mexican-23", categoryId: "c1", name: "پیتزا مکزیکی (۲۳ سانتی‌متر)", shortDescription: "ترکیب تند مکزیکی با فلفل و پنیر پیتزا", ingredients: ["ترکیب مکزیکی", "فلفل", "پنیر پیتزا"], prepMinutes: 21 },
  { slug: "pizza-mix-23", categoryId: "c1", name: "پیتزا میکس آمریکایی (۲۳ سانتی‌متر)", shortDescription: "ترکیب میکس اکسیژن در اندازه یک‌نفره", ingredients: ["خمیر آمریکایی", "ترکیب میکس", "پنیر پیتزا"], prepMinutes: 20 },
  { slug: "pizza-mix-32", categoryId: "c1", name: "پیتزا میکس آمریکایی (۳۲ سانتی‌متر)", shortDescription: "پیتزای بزرگ میکس با تاپینگ کامل", ingredients: ["خمیر آمریکایی", "ترکیب میکس", "پنیر پیتزا"], prepMinutes: 24 },
  { slug: "pizza-pepperoni-23", categoryId: "c1", name: "پیتزا پپرونی آمریکایی (۲۳ سانتی‌متر)", shortDescription: "پپرونی، پنیر پیتزا و طعم تند و محبوب", ingredients: ["پپرونی", "پنیر پیتزا", "فلفل"], prepMinutes: 20 },
  { slug: "pizza-pepperoni-28", categoryId: "c1", name: "پیتزا پپرونی آمریکایی دونفره (۲۸ سانتی‌متر)", shortDescription: "نسخه دونفره پیتزا پپرونی با پنیر فراوان", ingredients: ["پپرونی", "پنیر پیتزا", "فلفل"], prepMinutes: 23, popular: true },
  { slug: "pizza-greek-23", categoryId: "c1", name: "پیتزا یونانی آمریکایی (۲۳ سانتی‌متر)", shortDescription: "ترکیب سبک یونانی با سبزیجات و پنیر", ingredients: ["سبزیجات", "زیتون", "پنیر پیتزا"], prepMinutes: 20 },
  { slug: "pizza-greek-32", categoryId: "c1", name: "پیتزا یونانی آمریکایی (۳۲ سانتی‌متر)", shortDescription: "پیتزای بزرگ یونانی با سبزیجات تازه", ingredients: ["سبزیجات", "زیتون", "پنیر پیتزا"], prepMinutes: 24 },
  { slug: "pizza-greek-28", categoryId: "c1", name: "پیتزا یونانی آمریکایی دونفره (۲۸ سانتی‌متر)", shortDescription: "نسخه دونفره پیتزا یونانی با سبزیجات", ingredients: ["سبزیجات", "زیتون", "پنیر پیتزا"], prepMinutes: 23 },

  // برگر
  { slug: "burger-60", categoryId: "c2", name: "برگر ۶۰ درصد", shortDescription: "برگر گوشت با سبزیجات تازه و سس مخصوص اکسیژن", ingredients: ["برگر گوشت", "گوجه", "کاهو", "سس مخصوص"], prepMinutes: 15 },
  { slug: "burger-90", categoryId: "c2", name: "برگر ۹۰ درصد", shortDescription: "برگر پرگوشت با سبزیجات و سس مخصوص اکسیژن", ingredients: ["برگر گوشت", "گوجه", "کاهو", "سس مخصوص"], prepMinutes: 16, popular: true },
  { slug: "cheeseburger", categoryId: "c2", name: "چیز برگر", shortDescription: "برگر گوشت با پنیر، سبزیجات تازه و سس مخصوص", ingredients: ["برگر گوشت", "پنیر", "سبزیجات", "سس مخصوص"], prepMinutes: 16 },
  { slug: "cheeseburger-60", categoryId: "c2", name: "چیزبرگر ۶۰ درصد", shortDescription: "برگر ۶۰ درصد با پنیر و مخلفات تازه", ingredients: ["برگر گوشت", "پنیر", "سبزیجات", "سس مخصوص"], prepMinutes: 16 },

  // ساندویچ و اسنک
  { slug: "bomb-sandwich", categoryId: "c3", name: "ساندویچ بمب", shortDescription: "ساندویچ حجیم و پرملات با ترکیب ویژه اکسیژن", ingredients: ["نان ساندویچ", "ترکیب ویژه", "پنیر", "سبزیجات"], prepMinutes: 20, popular: true },
  { slug: "snack-special", categoryId: "c4", name: "اسنک مخصوص", shortDescription: "اسنک برشته با ترکیب مخصوص و سس اکسیژن", ingredients: ["نان تست", "ترکیب مخصوص", "پنیر", "سس"], prepMinutes: 14, popular: true },
  { slug: "snack-mixed", categoryId: "c4", name: "اسنک مخلوط", shortDescription: "اسنک مخلوط با پنیر و سس مخصوص", ingredients: ["نان تست", "ترکیب مخلوط", "پنیر", "سس"], prepMinutes: 14 },
  { slug: "snack-mexican", categoryId: "c4", name: "اسنک مکزیکی", shortDescription: "اسنک تند مکزیکی با پنیر و سس", ingredients: ["نان تست", "ترکیب مکزیکی", "پنیر", "سس"], prepMinutes: 14 },

  // سوخاری
  { slug: "fried-chicken-fillet-2", categoryId: "c5", name: "فیله سوخاری ۲ تکه", shortDescription: "دو تکه فیله مرغ سوخاری ترد و تازه", ingredients: ["فیله مرغ", "پودر سوخاری", "ادویه مخصوص"], prepMinutes: 18 },
  { slug: "fried-chicken-fillet-4", categoryId: "c5", name: "فیله سوخاری ۴ تکه", shortDescription: "چهار تکه فیله مرغ سوخاری ترد و تازه", ingredients: ["فیله مرغ", "پودر سوخاری", "ادویه مخصوص"], prepMinutes: 20, popular: true },
  { slug: "fried-chicken-fillet-6", categoryId: "c5", name: "فیله سوخاری ۶ تکه", shortDescription: "شش تکه فیله مرغ سوخاری مناسب اشتراک", ingredients: ["فیله مرغ", "پودر سوخاری", "ادویه مخصوص"], prepMinutes: 22 },
  { slug: "fried-chicken-fillet-8", categoryId: "c5", name: "فیله سوخاری ۸ تکه", shortDescription: "هشت تکه فیله مرغ سوخاری برای سفارش گروهی", ingredients: ["فیله مرغ", "پودر سوخاری", "ادویه مخصوص"], prepMinutes: 25 },
  { slug: "fried-mushroom", categoryId: "c5", name: "قارچ سوخاری", shortDescription: "قارچ سوخاری طلایی و ترد همراه سس", ingredients: ["قارچ", "پودر سوخاری", "ادویه مخصوص"], prepMinutes: 14 },

  // پیش‌غذا، پاستا و سالاد
  { slug: "fries", categoryId: "c6", name: "سیب‌زمینی سرخ‌شده", shortDescription: "سیب‌زمینی طلایی و ترد همراه سس", ingredients: ["سیب‌زمینی", "ادویه"], prepMinutes: 10 },
  { slug: "fries-cheese", categoryId: "c6", name: "سیب‌زمینی سرخ‌شده با پنیر پیتزا", shortDescription: "سیب‌زمینی ترد با پنیر پیتزای ذوب‌شده", ingredients: ["سیب‌زمینی", "پنیر پیتزا"], prepMinutes: 13 },
  { slug: "fries-cheese-mushroom", categoryId: "c6", name: "سیب‌زمینی سرخ‌شده با پنیر پیتزا و قارچ", shortDescription: "سیب‌زمینی با قارچ تازه و پنیر پیتزا", ingredients: ["سیب‌زمینی", "قارچ", "پنیر پیتزا"], prepMinutes: 14, popular: true },
  { slug: "pasta-penne", categoryId: "c7", name: "پاستا پنه", shortDescription: "پنه با سس خامه‌ای، قارچ و پنیر", ingredients: ["پاستا پنه", "سس خامه‌ای", "قارچ", "پنیر"], prepMinutes: 20 },
  { slug: "caesar-salad-fried-chicken", categoryId: "c8", name: "سالاد سزار با مرغ سوخاری", shortDescription: "کاهو، مرغ سوخاری، گوجه، زیتون و سس سزار", ingredients: ["کاهو", "مرغ سوخاری", "گوجه", "زیتون", "سس سزار"], prepMinutes: 12, popular: true },

  // نوشیدنی
  { slug: "water-small", categoryId: "c9", name: "آب معدنی کوچک", shortDescription: "بطری آب معدنی کوچک و خنک", ingredients: ["آب معدنی"], prepMinutes: 1 },
  { slug: "lemonade-family", categoryId: "c9", name: "لیموناد خانواده", shortDescription: "لیموناد گازدار خانواده، مناسب سفارش گروهی", ingredients: ["نوشیدنی لیموناد"], prepMinutes: 1 },
  { slug: "lemonade-glass", categoryId: "c9", name: "لیموناد شیشه‌ای", shortDescription: "بطری شیشه‌ای لیموناد خنک", ingredients: ["نوشیدنی لیموناد"], prepMinutes: 1 },
  { slug: "soda-zamzam-orange", categoryId: "c9", name: "نوشابه بطری زم‌زم پرتقالی", shortDescription: "نوشابه پرتقالی زم‌زم در بطری کوچک", ingredients: ["نوشابه گازدار"], prepMinutes: 1 },
  { slug: "soda-pepsi-bottle", categoryId: "c9", name: "نوشابه بطری پپسی کولا", shortDescription: "پپسی کولا در بطری کوچک و خنک", ingredients: ["نوشابه گازدار"], prepMinutes: 1 },
  { slug: "soda-family", categoryId: "c9", name: "نوشابه خانواده", shortDescription: "نوشابه خانواده در طعم‌های موجود", ingredients: ["نوشابه گازدار"], prepMinutes: 1 },
];

/** Hypothetical launch prices in toman, pending the restaurant's final price list. */
const HYPOTHETICAL_PRICES: Record<string, number> = {
  "pizza-four-season-28": 590000,
  "pizza-four-season-32": 790000,
  "pizza-oxygen-23": 430000,
  "pizza-roast-beef-23": 520000,
  "pizza-vegetables-23": 390000,
  "pizza-special-25": 510000,
  "pizza-special-28": 620000,
  "pizza-mixed-32": 760000,
  "pizza-chicken-mushroom-23": 450000,
  "pizza-mexican-23": 430000,
  "pizza-mix-23": 450000,
  "pizza-mix-32": 760000,
  "pizza-pepperoni-23": 420000,
  "pizza-pepperoni-28": 560000,
  "pizza-greek-23": 400000,
  "pizza-greek-32": 700000,
  "pizza-greek-28": 530000,
  "burger-60": 220000,
  "burger-90": 320000,
  cheeseburger: 280000,
  "cheeseburger-60": 250000,
  "bomb-sandwich": 450000,
  "snack-special": 190000,
  "snack-mixed": 170000,
  "snack-mexican": 180000,
  "fried-chicken-fillet-2": 190000,
  "fried-chicken-fillet-4": 340000,
  "fried-chicken-fillet-6": 480000,
  "fried-chicken-fillet-8": 620000,
  "fried-mushroom": 170000,
  fries: 120000,
  "fries-cheese": 180000,
  "fries-cheese-mushroom": 220000,
  "pasta-penne": 330000,
  "caesar-salad-fried-chicken": 320000,
  "water-small": 20000,
  "lemonade-family": 90000,
  "lemonade-glass": 45000,
  "soda-zamzam-orange": 40000,
  "soda-pepsi-bottle": 45000,
  "soda-family": 95000,
};

export const products: Product[] = productSeeds.map((seed, index) => ({
  id: `p${index + 1}`,
  slug: seed.slug,
  categoryId: seed.categoryId,
  name: seed.name,
  shortDescription: seed.shortDescription,
  description: `${seed.shortDescription}. این آیتم از منوی تصویری رسمی فست فود اکسیژن ثبت شده است.`,
  ingredients: seed.ingredients,
  price: HYPOTHETICAL_PRICES[seed.slug] ?? 0,
  image: `/food/${seed.slug}.webp`,
  popular: seed.popular ?? false,
  available: true,
  prepMinutes: seed.prepMinutes,
  rating: 4.8,
  soldCount: 0,
  modifiers: [],
  badges: seed.popular ? ["پیشنهاد اکسیژن"] : undefined,
}));

export const deliveryZones: DeliveryZone[] = [
  { id: "z1", name: "مرکز شهر فسا", fee: 20000, etaMinutes: 30, minOrder: 200000, active: true },
  { id: "z2", name: "بلوار امام خمینی", fee: 20000, etaMinutes: 30, minOrder: 200000, active: true },
  { id: "z3", name: "شهرک ولیعصر", fee: 30000, etaMinutes: 40, minOrder: 250000, active: true },
  { id: "z4", name: "میان‌جنگل و حومه", fee: 45000, etaMinutes: 55, minOrder: 300000, active: true },
];

export const coupons: Coupon[] = [
  {
    code: "OXYGEN10",
    type: "PERCENT",
    value: 10,
    maxDiscount: 60000,
    minOrder: 200000,
    firstOrderOnly: true,
    description: "۱۰٪ تخفیف اولین سفارش مستقیم از اکسیژن",
    active: true,
  },
  {
    code: "FASA20",
    type: "FIXED",
    value: 20000,
    minOrder: 400000,
    description: "۲۰ هزار تومان تخفیف سفارش‌های بالای ۴۰۰ هزار تومان",
    active: true,
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productsByCategory(categoryId: string) {
  return products.filter((product) => product.categoryId === categoryId);
}

export function popularProducts() {
  return products.filter((product) => product.popular);
}

export function smallImage(src: string) {
  return src.replace(/\.webp$/, "-sm.webp");
}
