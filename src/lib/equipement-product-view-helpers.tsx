import { ProductCategorySection } from "@/components/dashboard/sections/ProductCategorySection";
import {
  ProductsClass,
  EquipementProductMap,
  EquipementProduct,
} from "@/types/products";
import { formatPrice } from "./formatters";
import { Settings, Shield, ShoppingCart, Droplets } from "lucide-react";

interface EquipementProductViewProps {
  isComparing: boolean;
  products: ProductsClass<EquipementProductMap>;
  compareProducts?: ProductsClass<EquipementProductMap>;
  getTrend: (current?: string | number, previous?: string | number) => number;
  onClientChange?: (id: string) => void;
  filters?: import("@/types").FilterState;
  clientId?: string;
}

interface EquipementRow extends EquipementProduct {
  [key: string]: string | number;
  type: string;
}

interface MergedEquipementRow extends EquipementRow {
  prev_ca?: number;
  trend_ca?: number;
  prev_count?: number;
  trend_count?: number;
}

const iconMapping = {
  "Location Machines": (
    <Settings className="h-5 w-5 text-universe-equipement" />
  ),
  "Location Accessoires": (
    <Settings className="h-5 w-5 text-universe-equipement" />
  ),
  "Assistance Premium": <Shield className="h-5 w-5 text-universe-equipement" />,
  "Vente Machines": (
    <ShoppingCart className="h-5 w-5 text-universe-equipement" />
  ),
  "Vente Accessoires": (
    <ShoppingCart className="h-5 w-5 text-universe-equipement" />
  ),
  "Produits Entretien": (
    <Droplets className="h-5 w-5 text-universe-equipement" />
  ),
};

const typeMapping = ["Location Accessoires", "Vente Accessoires", "Typologie"];

export function renderEquipementProductView({
  isComparing,
  products,
  compareProducts,
  getTrend,
  onClientChange,
  filters,
  clientId,
}: EquipementProductViewProps) {
  if (!products) return null;

  const getTypologie = (
    src: ProductsClass<EquipementProductMap>,
    category: string,
  ) => src?.[category]?.Typologie ?? {};

  const injectRules: Record<
    string,
    { injectKey: string; fromCategory: string }
  > = {
    "Location Machines": {
      injectKey: "Location Accessoires",
      fromCategory: "Location Accessoires",
    },
    "Vente Machines": {
      injectKey: "Vente Accessoires",
      fromCategory: "Vente Accessoires",
    },
  };

  const normalizeProducts = (src: ProductsClass<EquipementProductMap>) => {
    if (!src) return null;

    return Object.fromEntries(
      Object.entries(src)
        // supprime les catégories accessoires si la catégorie machine existe (on les injecte dedans)
        .filter(([category]) => {
          const isLocationAcc = category === "Location Accessoires";
          const isVenteAcc = category === "Vente Accessoires";

          if (isLocationAcc) return !src["Location Machines"];
          if (isVenteAcc) return !src["Vente Machines"];

          return true;
        })
        // injection typologie sans mutation
        .map(([category, productMap]) => {
          const rule = injectRules[category];
          if (!rule) return [category, productMap];

          return [
            category,
            {
              ...productMap,
              [rule.injectKey]: getTypologie(src, rule.fromCategory),
            },
          ];
        }),
    );
  };

  const normalizedProducts = normalizeProducts(products);
  const normalizedCompare = normalizeProducts(compareProducts);

  if (!normalizedProducts) return null;

  const columns = (subCategory: string) => {
    const mainLabel = typeMapping.includes(subCategory) ? "Type" : "Marque";

    const base = [
      {
        key: "type",
        label: mainLabel,
        width: isComparing ? "w-[22%]" : "w-[40%]",
      },
      {
        key: "ca_total_ht",
        label: "CA",
        format: (v: number) => formatPrice(v),
        width: isComparing ? "w-[13%]" : "w-[30%]",
      },
    ] as const;

    const compareCA = isComparing
      ? ([
          {
            key: "prev_ca",
            label: "Préc. (CA)",
            format: (v: number) => (v !== undefined ? formatPrice(v) : "-"),
            width: "w-[13%]",
          },
          {
            key: "trend_ca",
            label: "Évol. (CA)",
            format: (v: number) => {
              if (v === undefined || Number.isNaN(v)) return "-";
              const colorClass =
                v > 0
                  ? "text-emerald-600"
                  : v < 0
                    ? "text-red-600"
                    : "text-muted-foreground";
              return (
                <span className={colorClass}>
                  {v > 0 ? "+" : ""}
                  {v.toFixed(1)}%
                </span>
              );
            },
            width: "w-[13%]",
          },
        ] as const)
      : ([] as const);

    const baseCount = [
      {
        key: "count",
        label: "Unités",
        width: isComparing ? "w-[13%]" : "w-[30%]",
      },
    ] as const;

    const compareCount = isComparing
      ? ([
          {
            key: "prev_count",
            label: "Préc. (Unités)",
            format: (v: number) => (v !== undefined ? v : "-"),
            width: "w-[13%]",
          },
          {
            key: "trend_count",
            label: "Évol. (Unités)",
            format: (v: number) => {
              if (v === undefined || Number.isNaN(v)) return "-";
              const colorClass =
                v > 0
                  ? "text-emerald-600"
                  : v < 0
                    ? "text-red-600"
                    : "text-muted-foreground";
              return (
                <span className={colorClass}>
                  {v > 0 ? "+" : ""}
                  {v.toFixed(1)}%
                </span>
              );
            },
            width: "w-[13%]",
          },
        ] as const)
      : ([] as const);

    return [...base, ...compareCA, ...baseCount, ...compareCount] as const;
  };

  const mergeWithTrend = (
    currentList: EquipementProductMap | undefined,
    prevList: EquipementProductMap | undefined,
  ): MergedEquipementRow[] => {
    const currentRows: EquipementRow[] = Object.entries(currentList ?? {}).map(
      ([productName, productData]) => ({
        ...productData,
        type: productName,
      }),
    );

    if (!isComparing) return currentRows;

    const prevRows: EquipementRow[] = Object.entries(prevList ?? {}).map(
      ([productName, productData]) => ({
        ...productData,
        type: productName,
      }),
    );

    return currentRows.map((row) => {
      const prevRow = prevRows.find((p) => p.type === row.type);

      const currentCA = row.ca_total_ht ?? 0;
      const prevCA = prevRow?.ca_total_ht;

      const currentCount = row.count ?? 0;
      const prevCount = prevRow?.count;

      return {
        ...row,
        prev_ca: prevCA,
        trend_ca: getTrend(currentCA, prevCA),
        prev_count: prevCount,
        trend_count: getTrend(currentCount, prevCount),
      };
    });
  };

  const renderSection = (
    category: string,
    subCategory: string,
    productList: EquipementProductMap,
  ) => {
    const prevList = normalizedCompare?.[category]?.[subCategory];
    const data = mergeWithTrend(productList, prevList);
    const categoryIgnoreTitle = ["Vente Machines", "Location Machines"];
    const subcategoryIgnoreTitle = [
      "Vente Accessoires",
      "Location Accessoires",
    ];
    const isSpecialModalTitle =
      categoryIgnoreTitle.includes(category) &&
      subcategoryIgnoreTitle.includes(subCategory);
    return (
      <ProductCategorySection
        key={`${category}-${subCategory}`}
        title={`Par ${subCategory}`}
        titleModal={`${isSpecialModalTitle ? "" : category} Par ${subCategory}`}
        columns={[...columns(subCategory)]}
        data={data}
        variant="equipement"
        onClientChange={onClientChange}
        filters={filters}
        clientId={clientId}
      />
    );
  };

  const renderSectionsLayout = (sections: JSX.Element[]) => {
    if (sections.length <= 1) return sections;

    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.slice(0, 2)}
        </div>
        {sections.length > 2 ? sections[sections.length - 1] : null}
      </>
    );
  };

  return Object.entries(normalizedProducts).map(([category, productMap]) => {
    const sections = Object.entries(productMap).map(
      ([subCategory, productList]) =>
        renderSection(
          category,
          subCategory,
          productList as EquipementProductMap,
        ),
    );

    return (
      <div key={category} className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          {iconMapping[category]}
          {category}
        </h3>

        {renderSectionsLayout(sections)}
      </div>
    );
  });
}
