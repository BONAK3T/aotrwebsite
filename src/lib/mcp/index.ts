import { defineMcp } from "@lovable.dev/mcp-js";
import searchItems from "./tools/search-items";
import getItemValue from "./tools/get-item-value";
import compareTrade from "./tools/compare-trade";
import listTrends from "./tools/list-trends";

export default defineMcp({
  name: "aot-r-values",
  title: "AOT:R Values",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Attack on Titan Revolution community trading value list. Use `search_items` to find items, `get_item_value` for one item's full details, `list_trends` for rising/dropping items, and `compare_trade` to check whether a trade is fair.",
  tools: [searchItems, getItemValue, listTrends, compareTrade],
});
