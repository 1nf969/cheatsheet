import { useState } from "react";

const ui = {
  ru: { subtitle: "Шпаргалка аналитика", search: "Поиск: команда, описание, пример...", commands: "команд", of: "из", syntax: "Синтаксис", example: "Пример", notFound: "Ничего не найдено" },
  en: { subtitle: "Analyst Cheatsheet", search: "Search: command, description, example...", commands: "commands", of: "of", syntax: "Syntax", example: "Example", notFound: "Nothing found" },
};

// L(item, "desc", lang) — returns lang version if exists, falls back to ru
const L = (item, field, lang) => {
  const key = lang === "en" ? field + "_en" : field;
  return item[key] !== undefined ? item[key] : item[field];
};

const data = {
  SQL: [
    {
      category: "Основа запроса (порядок важен!)", category_en: "Query Basics (order matters!)",
      items: [
        { cmd: "SELECT", desc: "Порядок выполнения: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", desc_en: "Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", syntax: "SELECT col1, col2\nFROM table\nWHERE condition\nGROUP BY col\nHAVING condition\nORDER BY col\nLIMIT n", example: "SELECT city, COUNT(*) AS cnt\nFROM users\nWHERE age > 18\nGROUP BY city\nHAVING COUNT(*) > 10\nORDER BY cnt DESC\nLIMIT 5" },
        { cmd: "DISTINCT", desc: "Уникальные значения в колонке", desc_en: "Unique values in a column", syntax: "SELECT DISTINCT col FROM table", example: "SELECT DISTINCT city FROM clients" },
        { cmd: "Алиасы AS", cmd_en: "Aliases AS", desc: "Переименовать колонку или таблицу в запросе", desc_en: "Rename a column or table in the query", syntax: "SELECT col AS new_name\nFROM table AS t", example: "SELECT u.name AS name, o.amount AS total\nFROM users u\nJOIN orders o ON u.id = o.user_id" },
      ],
    },
    {
      category: "Фильтрация WHERE", category_en: "Filtering WHERE",
      items: [
        { cmd: "AND / OR", desc: "AND — оба должны выполняться, OR — хотя бы одно", desc_en: "AND — both must be true, OR — at least one", syntax: "WHERE cond1 AND cond2\nWHERE cond1 OR cond2", example: "WHERE age > 18 AND city = 'Almaty'\nWHERE status = 'active' OR status = 'pending'" },
        { cmd: "IN", desc: "Значение из списка — короче чем несколько OR", desc_en: "Value from a list — shorter than multiple OR conditions", syntax: "WHERE col IN (val1, val2, val3)", example: "WHERE status IN ('active', 'pending', 'new')" },
        { cmd: "NOT IN", desc: "Исключить значения из списка", desc_en: "Exclude values from a list", syntax: "WHERE col NOT IN (val1, val2)", example: "WHERE city NOT IN ('Almaty', 'Astana')" },
        { cmd: "BETWEEN", desc: "Диапазон значений включая границы", desc_en: "Range of values, boundaries included", syntax: "WHERE col BETWEEN a AND b", example: "WHERE price BETWEEN 1000 AND 5000\nWHERE date BETWEEN '2024-01-01' AND '2024-12-31'" },
        { cmd: "LIKE", desc: "% = любые символы, _ = ровно один символ", desc_en: "% = any characters, _ = exactly one character", syntax: "WHERE col LIKE 'pattern'", example: "WHERE name LIKE 'Ivan%'\nWHERE phone LIKE '+7%'\nWHERE code LIKE 'A_3'" },
        { cmd: "IS NULL / IS NOT NULL", desc: "Проверка на пустоту. = NULL не работает!", desc_en: "Check for empty values. = NULL doesn't work!", syntax: "WHERE col IS NULL\nWHERE col IS NOT NULL", example: "WHERE phone IS NULL\nWHERE email IS NOT NULL" },
        { cmd: "NOT", desc: "Инверсия условия", desc_en: "Negate a condition", syntax: "WHERE NOT condition", example: "WHERE NOT city = 'Almaty'\nWHERE NOT age BETWEEN 18 AND 60" },
      ],
    },
    {
      category: "Сортировка ORDER BY", category_en: "Sorting ORDER BY",
      items: [
        { cmd: "ORDER BY ASC", desc: "По возрастанию. ASC по умолчанию — можно не писать", desc_en: "Ascending order. ASC is default — can be omitted", syntax: "ORDER BY col ASC", example: "ORDER BY age ASC\nORDER BY name ASC   -- A to Z\nORDER BY date ASC   -- oldest first" },
        { cmd: "ORDER BY DESC", desc: "По убыванию", desc_en: "Descending order", syntax: "ORDER BY col DESC", example: "ORDER BY salary DESC\nORDER BY date DESC   -- newest first\nORDER BY amount DESC -- largest first" },
        { cmd: "Несколько колонок", cmd_en: "Multiple columns", desc: "Сначала по col1, при совпадении — по col2", desc_en: "Sort by col1 first, then col2 on ties", syntax: "ORDER BY col1 DESC, col2 ASC", example: "ORDER BY city ASC, salary DESC\n-- by city A-Z, then salary descending" },
        { cmd: "ORDER BY по номеру", cmd_en: "ORDER BY column number", desc: "Сортировать по 3-й колонке в SELECT. Удобно для COUNT(*)", desc_en: "Sort by the 3rd column in SELECT. Handy for COUNT(*)", syntax: "ORDER BY 3 DESC", example: "SELECT city, dept, COUNT(*)\nFROM users\nGROUP BY city, dept\nORDER BY 3 DESC" },
        { cmd: "NULLS LAST / FIRST", desc: "Куда поместить NULL при сортировке (PostgreSQL)", desc_en: "Where to place NULLs when sorting (PostgreSQL)", syntax: "ORDER BY col DESC NULLS LAST\nORDER BY col ASC NULLS FIRST", example: "ORDER BY salary DESC NULLS LAST" },
        { cmd: "LIMIT / TOP", desc: "Ограничить количество строк", desc_en: "Limit number of result rows", syntax: "LIMIT n              -- PostgreSQL, MySQL\nSELECT TOP n ...     -- MS SQL", example: "SELECT * FROM orders\nORDER BY amount DESC\nLIMIT 10" },
        { cmd: "LIMIT + OFFSET", desc: "Пропустить m строк — пагинация", desc_en: "Skip m rows — pagination", syntax: "LIMIT n OFFSET m", example: "LIMIT 10 OFFSET 0   -- page 1\nLIMIT 10 OFFSET 10  -- page 2\nLIMIT 10 OFFSET 20  -- page 3" },
      ],
    },
    {
      category: "Агрегация GROUP BY", category_en: "Aggregation GROUP BY",
      items: [
        { cmd: "COUNT", desc: "* = все строки, col = непустые, DISTINCT = уникальные", desc_en: "* = all rows, col = non-null rows, DISTINCT = unique values", syntax: "COUNT(*)\nCOUNT(col)\nCOUNT(DISTINCT col)", example: "SELECT COUNT(*) FROM orders\nSELECT COUNT(phone) FROM users\nSELECT COUNT(DISTINCT user_id) FROM orders" },
        { cmd: "SUM / AVG", desc: "Сумма и среднее. Игнорируют NULL", desc_en: "Sum and average. Both ignore NULLs", syntax: "SUM(col)\nAVG(col)", example: "SELECT SUM(amount) AS revenue,\n       AVG(amount) AS avg_order\nFROM orders" },
        { cmd: "MIN / MAX", desc: "Минимум и максимум. Работают с датами и текстом", desc_en: "Min and max. Work with dates and text too", syntax: "MIN(col)\nMAX(col)", example: "SELECT MIN(date) AS first_order,\n       MAX(date) AS last_order\nFROM orders" },
        { cmd: "GROUP BY", desc: "Все колонки в SELECT без агрегации — должны быть в GROUP BY", desc_en: "All non-aggregated columns in SELECT must appear in GROUP BY", syntax: "GROUP BY col1, col2", example: "SELECT city, status, COUNT(*) AS cnt\nFROM users\nGROUP BY city, status\nORDER BY cnt DESC" },
        { cmd: "HAVING", desc: "Фильтр ПОСЛЕ группировки. WHERE нельзя использовать с агрегатами", desc_en: "Filter AFTER grouping. Can't use WHERE with aggregate functions", syntax: "HAVING aggregate_condition", example: "SELECT city, COUNT(*) AS cnt\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 100" },
        { cmd: "WHERE vs HAVING", desc: "WHERE фильтрует строки, HAVING фильтрует группы. Можно оба сразу", desc_en: "WHERE filters rows, HAVING filters groups. Both can be used together", syntax: "WHERE -- before grouping\nHAVING -- after grouping", example: "SELECT city, COUNT(*) AS cnt\nFROM users\nWHERE age > 18\nGROUP BY city\nHAVING COUNT(*) > 50" },
      ],
    },
    {
      category: "Условия и преобразования", category_en: "Conditions & Conversions",
      items: [
        { cmd: "CASE WHEN", desc: "Условная логика — аналог IF/ELSE. Работает в SELECT, WHERE, ORDER BY", desc_en: "Conditional logic — like IF/ELSE. Works in SELECT, WHERE, ORDER BY", syntax: "CASE\n  WHEN condition1 THEN value1\n  WHEN condition2 THEN value2\n  ELSE default_value\nEND", example: "SELECT name,\n  CASE\n    WHEN age < 18 THEN 'Child'\n    WHEN age < 60 THEN 'Adult'\n    ELSE 'Senior'\n  END AS category\nFROM users" },
        { cmd: "COALESCE", desc: "Вернуть первое НЕ NULL значение", desc_en: "Return the first non-NULL value", syntax: "COALESCE(val1, val2, val3, ...)", example: "SELECT COALESCE(phone, email, 'No contact') AS contact\nFROM users" },
        { cmd: "NULLIF", desc: "Вернуть NULL если val1 = val2. Защита от деления на ноль", desc_en: "Return NULL if val1 = val2. Prevents division by zero", syntax: "NULLIF(val1, val2)", example: "SELECT amount / NULLIF(cnt, 0) AS average\n-- returns NULL instead of error if cnt = 0" },
        { cmd: "CAST", desc: "Преобразовать тип данных", desc_en: "Convert data type", syntax: "CAST(col AS type)\ncol::type  -- PostgreSQL", example: "CAST(price AS VARCHAR)\nCAST('2024-01-01' AS DATE)\nprice::INT" },
        { cmd: "ROUND / FLOOR / CEIL", desc: "Округление: обычное / вниз / вверх", desc_en: "Rounding: standard / down / up", syntax: "ROUND(number, digits)\nFLOOR(number)\nCEIL(number)", example: "ROUND(AVG(salary), 0)\nFLOOR(3.9)  -- = 3\nCEIL(3.1)   -- = 4" },
      ],
    },
    {
      category: "JOIN — объединение таблиц", category_en: "JOIN — Combining Tables",
      items: [
        { cmd: "INNER JOIN", desc: "Только строки где есть совпадение в обеих таблицах", desc_en: "Only rows with a match in both tables", syntax: "FROM t1\nINNER JOIN t2 ON t1.id = t2.fk", example: "FROM users u\nINNER JOIN orders o ON u.id = o.user_id" },
        { cmd: "LEFT JOIN", desc: "Все строки из левой + совпадения из правой. Нет совпадения — NULL", desc_en: "All rows from left + matches from right. No match — NULL", syntax: "FROM t1\nLEFT JOIN t2 ON t1.id = t2.fk", example: "FROM users u\nLEFT JOIN orders o ON u.id = o.user_id\n-- users with no orders get NULL" },
        { cmd: "LEFT JOIN (только без)", cmd_en: "LEFT JOIN (no match only)", desc: "Строки из левой таблицы БЕЗ совпадений в правой", desc_en: "Rows from left table WITHOUT matches in right", syntax: "FROM t1\nLEFT JOIN t2 ON t1.id = t2.fk\nWHERE t2.id IS NULL", example: "FROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.id IS NULL  -- users with no orders" },
        { cmd: "FULL OUTER JOIN", desc: "Все строки обеих таблиц. Нет совпадения — NULL с обеих сторон", desc_en: "All rows from both tables. No match — NULL on either side", syntax: "FROM t1\nFULL OUTER JOIN t2 ON t1.id = t2.id", example: "FROM plan p\nFULL OUTER JOIN fact f ON p.month = f.month" },
        { cmd: "UNION / UNION ALL", desc: "Склеить результаты вертикально. UNION убирает дубли, UNION ALL быстрее", desc_en: "Stack results vertically. UNION removes duplicates, UNION ALL is faster", syntax: "SELECT ...\nUNION\nSELECT ...", example: "SELECT name, 'client' AS type FROM clients\nUNION ALL\nSELECT name, 'lead' AS type FROM leads" },
        { cmd: "JOIN на несколько условий", cmd_en: "JOIN on multiple conditions", desc: "Объединить по нескольким колонкам", desc_en: "Join on multiple columns", syntax: "JOIN t2 ON t1.id = t2.id\n  AND t1.year = t2.year", example: "FROM sales s\nJOIN plan p\n  ON s.region = p.region\n  AND s.month = p.month" },
      ],
    },
    {
      category: "CTE и подзапросы", category_en: "CTE & Subqueries",
      items: [
        { cmd: "CTE (WITH)", desc: "Именованный подзапрос. Делает код читаемым", desc_en: "Named subquery. Makes code readable. Analysts use it all the time", syntax: "WITH name AS (\n  SELECT ...\n)\nSELECT * FROM name", example: "WITH active AS (\n  SELECT * FROM users\n  WHERE status = 'active'\n)\nSELECT city, COUNT(*)\nFROM active\nGROUP BY city" },
        { cmd: "Несколько CTE", cmd_en: "Multiple CTEs", desc: "CTE могут ссылаться друг на друга", desc_en: "CTEs can reference each other — instead of nested subqueries", syntax: "WITH cte1 AS (\n  SELECT ...\n),\ncte2 AS (\n  SELECT ... FROM cte1\n)\nSELECT * FROM cte2", example: "WITH orders_24 AS (\n  SELECT * FROM orders WHERE YEAR(date)=2024\n),\ntop_clients AS (\n  SELECT user_id, SUM(amount) total\n  FROM orders_24\n  GROUP BY user_id\n  HAVING SUM(amount) > 100000\n)\nSELECT u.name, t.total\nFROM top_clients t\nJOIN users u ON t.user_id = u.id" },
        { cmd: "Subquery в WHERE", cmd_en: "Subquery in WHERE", desc: "Подзапрос как условие фильтрации", desc_en: "Subquery as a filter condition", syntax: "WHERE col IN (\n  SELECT col FROM ...\n)", example: "WHERE user_id IN (\n  SELECT id FROM users\n  WHERE city = 'Almaty'\n)" },
        { cmd: "EXISTS", desc: "Проверить наличие строк. Быстрее IN для больших таблиц", desc_en: "Check for existence of rows. Faster than IN for large tables", syntax: "WHERE EXISTS (\n  SELECT 1 FROM ... WHERE ...\n)", example: "WHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.user_id = u.id\n  AND o.amount > 1000\n)" },
      ],
    },
    {
      category: "Оконные функции OVER", category_en: "Window Functions OVER",
      items: [
        { cmd: "ROW_NUMBER", desc: "Порядковый номер строки в группе. Без пропусков при совпадении", desc_en: "Row number within a group. No gaps on ties", syntax: "ROW_NUMBER() OVER (\n  PARTITION BY col\n  ORDER BY col\n)", example: "SELECT name, salary,\n  ROW_NUMBER() OVER (\n    PARTITION BY dept\n    ORDER BY salary DESC\n  ) AS nr\nFROM employees" },
        { cmd: "RANK / DENSE_RANK", desc: "RANK — с пропусками (1,2,2,4). DENSE_RANK — без (1,2,2,3)", desc_en: "RANK — with gaps (1,2,2,4). DENSE_RANK — without gaps (1,2,2,3)", syntax: "RANK() OVER (ORDER BY col DESC)\nDENSE_RANK() OVER (ORDER BY col DESC)", example: "SELECT name, score,\n  RANK() OVER (ORDER BY score DESC) AS rank\nFROM students" },
        { cmd: "SUM / AVG OVER", desc: "Нарастающая сумма или скользящее среднее", desc_en: "Running total or moving average", syntax: "SUM(col) OVER (\n  PARTITION BY col\n  ORDER BY col\n)", example: "SELECT month, revenue,\n  SUM(revenue) OVER (\n    ORDER BY month\n  ) AS running_total\nFROM monthly_sales" },
        { cmd: "LAG / LEAD", desc: "Значение из предыдущей / следующей строки", desc_en: "Value from the previous / next row", syntax: "LAG(col, n) OVER (ORDER BY col)\nLEAD(col, n) OVER (ORDER BY col)", example: "SELECT month, revenue,\n  LAG(revenue,1) OVER (ORDER BY month) AS prev,\n  revenue - LAG(revenue,1) OVER (ORDER BY month) AS growth\nFROM monthly_sales" },
        { cmd: "PARTITION BY", desc: "Разбить на группы. Как GROUP BY, но строки не схлопываются", desc_en: "Divide into groups. Like GROUP BY but rows aren't collapsed", syntax: "OVER (PARTITION BY col)", example: "SELECT region, sales,\n  sales * 100.0 / SUM(sales) OVER () AS share\nFROM regional_sales" },
        { cmd: "FIRST_VALUE", desc: "Первое значение в окне", desc_en: "First value in the window", syntax: "FIRST_VALUE(col) OVER (\n  PARTITION BY col ORDER BY col\n)", example: "SELECT user_id, order_date,\n  FIRST_VALUE(order_date) OVER (\n    PARTITION BY user_id\n    ORDER BY order_date\n  ) AS first_order\nFROM orders" },
      ],
    },
    {
      category: "Строковые функции", category_en: "String Functions",
      items: [
        { cmd: "CONCAT", desc: "Склеить строки", desc_en: "Concatenate strings", syntax: "CONCAT(str1, str2, str3)", example: "SELECT CONCAT(first_name, ' ', last_name)\nFROM users" },
        { cmd: "UPPER / LOWER", desc: "Регистр. Полезно для нормализации перед сравнением", desc_en: "Case conversion. Useful for normalization before comparison", syntax: "UPPER(col)\nLOWER(col)", example: "WHERE LOWER(city) = 'almaty'" },
        { cmd: "TRIM", desc: "Убрать пробелы по краям", desc_en: "Remove leading and trailing spaces", syntax: "TRIM(col)\nLTRIM(col)\nRTRIM(col)", example: "SELECT TRIM(name) FROM users" },
        { cmd: "LENGTH / LEN", desc: "Длина строки в символах", desc_en: "String length in characters", syntax: "LENGTH(col)  -- PostgreSQL, MySQL\nLEN(col)     -- MS SQL", example: "WHERE LENGTH(phone) = 11" },
        { cmd: "SUBSTRING", desc: "Извлечь часть строки", desc_en: "Extract part of a string", syntax: "SUBSTRING(col, start, length)", example: "SUBSTRING(phone, 2, 10)\nSUBSTRING(inn, 1, 2)" },
        { cmd: "REPLACE", desc: "Заменить все вхождения подстроки", desc_en: "Replace all occurrences of a substring", syntax: "REPLACE(col, old, new)", example: "REPLACE(phone, '+7', '8')" },
      ],
    },
    {
      category: "Даты", category_en: "Dates",
      items: [
        { cmd: "Текущая дата", cmd_en: "Current Date", desc: "Текущая дата / дата+время", desc_en: "Current date / date+time", syntax: "CURRENT_DATE\nCURRENT_TIMESTAMP\nNOW()", example: "WHERE date >= CURRENT_DATE - INTERVAL '30 days'" },
        { cmd: "EXTRACT", desc: "Извлечь часть даты: год, месяц, день недели", desc_en: "Extract date part: year, month, day of week", syntax: "EXTRACT(YEAR FROM date)\nEXTRACT(MONTH FROM date)\nEXTRACT(DOW FROM date)", example: "SELECT EXTRACT(YEAR FROM order_date) AS year,\n       EXTRACT(MONTH FROM order_date) AS month,\n       COUNT(*)\nFROM orders\nGROUP BY 1, 2" },
        { cmd: "DATE_TRUNC", desc: "Округлить до начала периода (PostgreSQL)", desc_en: "Truncate to start of period (PostgreSQL). For grouping by month", syntax: "DATE_TRUNC('month', date)\nDATE_TRUNC('week', date)", example: "SELECT DATE_TRUNC('month', order_date) AS month,\n       SUM(amount)\nFROM orders\nGROUP BY 1\nORDER BY 1" },
        { cmd: "DATEDIFF", desc: "Разница между датами в днях", desc_en: "Difference between dates in days", syntax: "DATEDIFF(day, date1, date2)  -- MS SQL\ndate2 - date1                -- PostgreSQL", example: "DATEDIFF(day, reg_date, first_order_date)" },
        { cmd: "INTERVAL", desc: "Прибавить / вычесть период", desc_en: "Add / subtract a time period", syntax: "date + INTERVAL '7 days'\ndate - INTERVAL '1 month'", example: "WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'" },
        { cmd: "TO_CHAR / FORMAT", desc: "Дата в текстовом формате для группировки", desc_en: "Date as text format for grouping", syntax: "TO_CHAR(date, 'YYYY-MM')  -- PostgreSQL\nFORMAT(date, 'yyyy-MM')   -- MS SQL", example: "SELECT TO_CHAR(order_date, 'YYYY-MM') AS month\nFROM orders\nGROUP BY 1" },
      ],
    },
  ],

  Excel: [
    {
      category: "Поиск и ссылки", category_en: "Lookup & Reference",
      items: [
        { cmd: "ВПР (VLOOKUP)", cmd_en: "VLOOKUP", desc: "Найти значение по ключу вертикально. 0 = точное совпадение — всегда!", desc_en: "Find a value by key vertically. 0 = exact match — always use it!", syntax: "=ВПР(что_ищем; таблица; номер_столбца; 0)", syntax_en: "=VLOOKUP(lookup_value, table, col_index, 0)", example: "=ВПР(A2;$D$2:$F$100;2;0)", example_en: "=VLOOKUP(A2,$D$2:$F$100,2,0)" },
        { cmd: "ГПР (HLOOKUP)", cmd_en: "HLOOKUP", desc: "Горизонтальный поиск (по строке)", desc_en: "Horizontal lookup (by row)", syntax: "=ГПР(что_ищем; таблица; номер_строки; 0)", syntax_en: "=HLOOKUP(lookup_value, table, row_index, 0)", example: "=ГПР(A1;$A$1:$Z$3;2;0)", example_en: "=HLOOKUP(A1,$A$1:$Z$3,2,0)" },
        { cmd: "ИНДЕКС+ПОИСКПОЗ (INDEX+MATCH)", cmd_en: "INDEX+MATCH", desc: "Мощнее ВПР — ищет в любую сторону, не зависит от порядка столбцов", desc_en: "More powerful than VLOOKUP — searches in any direction, independent of column order", syntax: "=ИНДЕКС(столбец_результата;\n  ПОИСКПОЗ(значение; столбец_поиска; 0))", syntax_en: "=INDEX(result_col,\n  MATCH(value, lookup_col, 0))", example: "=ИНДЕКС(E2:E100;\n  ПОИСКПОЗ(A2;D2:D100;0))", example_en: "=INDEX(E2:E100,\n  MATCH(A2,D2:D100,0))" },
        { cmd: "ПОИСКПОЗ (MATCH)", cmd_en: "MATCH", desc: "Возвращает позицию значения в диапазоне", desc_en: "Returns the position of a value in a range", syntax: "=ПОИСКПОЗ(значение; диапазон; 0)", syntax_en: "=MATCH(value, range, 0)", example: "=ПОИСКПОЗ(\"Алматы\";A2:A50;0)", example_en: "=MATCH(\"Almaty\",A2:A50,0)" },
        { cmd: "ДВССЫЛ (INDIRECT)", cmd_en: "INDIRECT", desc: "Ссылка из текстовой строки — динамические диапазоны", desc_en: "Reference from a text string — dynamic ranges", syntax: "=ДВССЫЛ(\"ссылка_текстом\")", syntax_en: "=INDIRECT(\"reference_as_text\")", example: "=ДВССЫЛ(\"A\"&B2)", example_en: "=INDIRECT(\"A\"&B2)" },
        { cmd: "СМЕЩ (OFFSET)", cmd_en: "OFFSET", desc: "Динамический диапазон со смещением", desc_en: "Dynamic range offset from a cell", syntax: "=СМЕЩ(начало; строки; столбцы; высота; ширина)", syntax_en: "=OFFSET(start, rows, cols, height, width)", example: "=СМЕЩ(A1;2;1;5;1)", example_en: "=OFFSET(A1,2,1,5,1)" },
      ],
    },
    {
      category: "Условия и логика", category_en: "Conditions & Logic",
      items: [
        { cmd: "ЕСЛИ (IF)", cmd_en: "IF", desc: "Базовое условие", desc_en: "Basic condition", syntax: "=ЕСЛИ(условие; если_истина; если_ложь)", syntax_en: "=IF(condition, if_true, if_false)", example: "=ЕСЛИ(A2>100;\"Много\";\"Мало\")", example_en: "=IF(A2>100,\"Many\",\"Few\")" },
        { cmd: "ЕСЛИ вложенный (nested IF)", cmd_en: "Nested IF", desc: "Несколько условий цепочкой", desc_en: "Multiple conditions chained", syntax: "=ЕСЛИ(cond1;val1;\n  ЕСЛИ(cond2;val2;default))", syntax_en: "=IF(cond1,val1,\n  IF(cond2,val2,default))", example: "=ЕСЛИ(A2>90;\"A\";\n  ЕСЛИ(A2>70;\"B\";\n    ЕСЛИ(A2>50;\"C\";\"D\")))", example_en: "=IF(A2>90,\"A\",\n  IF(A2>70,\"B\",\n    IF(A2>50,\"C\",\"D\")))" },
        { cmd: "И / ИЛИ (AND / OR)", cmd_en: "AND / OR", desc: "Комбинировать условия внутри ЕСЛИ", desc_en: "Combine conditions inside IF", syntax: "=И(условие1;условие2)\n=ИЛИ(условие1;условие2)", syntax_en: "=AND(condition1,condition2)\n=OR(condition1,condition2)", example: "=ЕСЛИ(И(A2>18;B2=\"М\");\n  \"Взрослый мужчина\";\"Другое\")", example_en: "=IF(AND(A2>18,B2=\"M\"),\n  \"Adult male\",\"Other\")" },
        { cmd: "ЕСЛИОШИБКА (IFERROR)", cmd_en: "IFERROR", desc: "Заменить любую ошибку. Незаменимо с ВПР", desc_en: "Replace any error with a value. Essential with VLOOKUP", syntax: "=ЕСЛИОШИБКА(формула; что_вернуть)", syntax_en: "=IFERROR(formula, value_if_error)", example: "=ЕСЛИОШИБКА(ВПР(A2;D:E;2;0);\"Не найдено\")", example_en: "=IFERROR(VLOOKUP(A2,D:E,2,0),\"Not found\")" },
        { cmd: "ЕСНД (IFNA)", cmd_en: "IFNA", desc: "Только ошибку #Н/Д", desc_en: "Only catches #N/A errors", syntax: "=ЕСНД(формула; значение)", syntax_en: "=IFNA(formula, value)", example: "=ЕСНД(ВПР(A2;D:E;2;0);\"Нет в справочнике\")", example_en: "=IFNA(VLOOKUP(A2,D:E,2,0),\"Not in reference\")" },
        { cmd: "УСЛОВИЯ (IFS)", cmd_en: "IFS", desc: "Множественные условия без вложенности (Excel 2019+)", desc_en: "Multiple conditions without nesting (Excel 2019+)", syntax: "=УСЛОВИЯ(cond1;val1;cond2;val2;ИСТИНА;default)", syntax_en: "=IFS(cond1,val1,cond2,val2,TRUE,default)", example: "=УСЛОВИЯ(A2>90;\"A\";A2>70;\"B\";ИСТИНА;\"C\")", example_en: "=IFS(A2>90,\"A\",A2>70,\"B\",TRUE,\"C\")" },
        { cmd: "НЕ (NOT)", cmd_en: "NOT", desc: "Инверсия условия", desc_en: "Invert a condition", syntax: "=НЕ(условие)", syntax_en: "=NOT(condition)", example: "=ЕСЛИ(НЕ(A2=\"\");A2;\"Пусто\")", example_en: "=IF(NOT(A2=\"\"),A2,\"Empty\")" },
      ],
    },
    {
      category: "Подсчёт и суммирование", category_en: "Counting & Summation",
      items: [
        { cmd: "СЧЁТ / СЧЁТЗ (COUNT / COUNTA)", cmd_en: "COUNT / COUNTA", desc: "СЧЁТ — числовые, СЧЁТЗ — любые непустые", desc_en: "COUNT — numeric cells, COUNTA — any non-empty cells", syntax: "=СЧЁТ(диапазон)\n=СЧЁТЗ(диапазон)", syntax_en: "=COUNT(range)\n=COUNTA(range)", example: "=СЧЁТ(B2:B100)\n=СЧЁТЗ(A2:A100)", example_en: "=COUNT(B2:B100)\n=COUNTA(A2:A100)" },
        { cmd: "СЧИТАТЬПУСТОТЫ (COUNTBLANK)", cmd_en: "COUNTBLANK", desc: "Считать пустые ячейки", desc_en: "Count empty cells", syntax: "=СЧИТАТЬПУСТОТЫ(диапазон)", syntax_en: "=COUNTBLANK(range)", example: "=СЧИТАТЬПУСТОТЫ(A2:A100)", example_en: "=COUNTBLANK(A2:A100)" },
        { cmd: "СЧЁТЕСЛИ (COUNTIF)", cmd_en: "COUNTIF", desc: "Считать по одному условию", desc_en: "Count by one condition", syntax: "=СЧЁТЕСЛИ(диапазон; критерий)", syntax_en: "=COUNTIF(range, criteria)", example: "=СЧЁТЕСЛИ(B2:B100;\">50\")\n=СЧЁТЕСЛИ(A2:A100;\"Алматы\")", example_en: "=COUNTIF(B2:B100,\">50\")\n=COUNTIF(A2:A100,\"Almaty\")" },
        { cmd: "СЧЁТЕСЛИМН (COUNTIFS)", cmd_en: "COUNTIFS", desc: "Считать по нескольким условиям", desc_en: "Count by multiple conditions", syntax: "=СЧЁТЕСЛИМН(диап1;крит1;диап2;крит2)", syntax_en: "=COUNTIFS(range1,criteria1,range2,criteria2)", example: "=СЧЁТЕСЛИМН(A2:A100;\"М\";B2:B100;\">25\")", example_en: "=COUNTIFS(A2:A100,\"M\",B2:B100,\">25\")" },
        { cmd: "СУММ (SUM)", cmd_en: "SUM", desc: "Сумма всех значений", desc_en: "Sum all values", syntax: "=СУММ(диапазон)", syntax_en: "=SUM(range)", example: "=СУММ(C2:C100)", example_en: "=SUM(C2:C100)" },
        { cmd: "СУММЕСЛИ (SUMIF)", cmd_en: "SUMIF", desc: "Сумма по одному условию", desc_en: "Sum by one condition", syntax: "=СУММЕСЛИ(диапазон; критерий; диап_суммы)", syntax_en: "=SUMIF(range, criteria, sum_range)", example: "=СУММЕСЛИ(A2:A100;\"Алматы\";C2:C100)", example_en: "=SUMIF(A2:A100,\"Almaty\",C2:C100)" },
        { cmd: "СУММЕСЛИМН (SUMIFS)", cmd_en: "SUMIFS", desc: "Сумма по нескольким условиям", desc_en: "Sum by multiple conditions", syntax: "=СУММЕСЛИМН(диап_суммы;диап1;крит1;диап2;крит2)", syntax_en: "=SUMIFS(sum_range,range1,criteria1,range2,criteria2)", example: "=СУММЕСЛИМН(D2:D100;A2:A100;\"KZ\";B2:B100;2024)", example_en: "=SUMIFS(D2:D100,A2:A100,\"KZ\",B2:B100,2024)" },
        { cmd: "СРЗНАЧЕСЛИ (AVERAGEIF)", cmd_en: "AVERAGEIF", desc: "Среднее по условию", desc_en: "Average by one condition", syntax: "=СРЗНАЧЕСЛИ(диапазон; критерий; диап_среднего)", syntax_en: "=AVERAGEIF(range, criteria, avg_range)", example: "=СРЗНАЧЕСЛИ(A2:A100;\"М\";B2:B100)", example_en: "=AVERAGEIF(A2:A100,\"M\",B2:B100)" },
        { cmd: "ПРОМЕЖУТОЧНЫЕ.ИТОГИ (SUBTOTAL)", cmd_en: "SUBTOTAL", desc: "Считает только видимые строки — работает с фильтром!", desc_en: "Counts only visible rows — works with filters!", syntax: "=ПРОМЕЖУТОЧНЫЕ.ИТОГИ(номер; диапазон)\n9=СУММ, 3=СЧЁТЗ, 1=СРЗНАЧ", syntax_en: "=SUBTOTAL(function_num, range)\n9=SUM, 3=COUNTA, 1=AVERAGE", example: "=ПРОМЕЖУТОЧНЫЕ.ИТОГИ(9;C2:C100)", example_en: "=SUBTOTAL(9,C2:C100)" },
      ],
    },
    {
      category: "Текст", category_en: "Text",
      items: [
        { cmd: "Склейка &", cmd_en: "Concatenation &", desc: "Склеить строки", desc_en: "Concatenate strings", syntax: "=A1&\" \"&B1", syntax_en: "=A1&\" \"&B1", example: "=A2&\" \"&B2", example_en: "=A2&\" \"&B2" },
        { cmd: "ОБЪЕДИНИТЬ (TEXTJOIN)", cmd_en: "TEXTJOIN", desc: "Склеить диапазон с разделителем", desc_en: "Join a range with a delimiter", syntax: "=ОБЪЕДИНИТЬ(разделитель; ИСТИНА; диапазон)", syntax_en: "=TEXTJOIN(delimiter, TRUE, range)", example: "=ОБЪЕДИНИТЬ(\", \";ИСТИНА;A2:A10)", example_en: "=TEXTJOIN(\", \",TRUE,A2:A10)" },
        { cmd: "ЛЕВСИМВ / ПРАВСИМВ (LEFT / RIGHT)", cmd_en: "LEFT / RIGHT", desc: "Первые / последние n символов", desc_en: "First / last n characters", syntax: "=ЛЕВСИМВ(текст;n)\n=ПРАВСИМВ(текст;n)", syntax_en: "=LEFT(text,n)\n=RIGHT(text,n)", example: "=ЛЕВСИМВ(A2;3)\n=ПРАВСИМВ(A2;4)", example_en: "=LEFT(A2,3)\n=RIGHT(A2,4)" },
        { cmd: "ПСТР (MID)", cmd_en: "MID", desc: "Символы из середины строки", desc_en: "Characters from the middle of a string", syntax: "=ПСТР(текст; начало; кол-во)", syntax_en: "=MID(text, start, count)", example: "=ПСТР(A2;3;5)", example_en: "=MID(A2,3,5)" },
        { cmd: "ДЛСТР (LEN)", cmd_en: "LEN", desc: "Длина строки", desc_en: "String length", syntax: "=ДЛСТР(текст)", syntax_en: "=LEN(text)", example: "=ЕСЛИ(ДЛСТР(A2)=11;\"ОК\";\"Ошибка\")", example_en: "=IF(LEN(A2)=11,\"OK\",\"Error\")" },
        { cmd: "СЖПРОБЕЛЫ (TRIM)", cmd_en: "TRIM", desc: "Убрать лишние пробелы — обязательно при очистке данных", desc_en: "Remove extra spaces — essential for data cleaning", syntax: "=СЖПРОБЕЛЫ(текст)", syntax_en: "=TRIM(text)", example: "=СЖПРОБЕЛЫ(A2)", example_en: "=TRIM(A2)" },
        { cmd: "ПОДСТАВИТЬ (SUBSTITUTE)", cmd_en: "SUBSTITUTE", desc: "Заменить все вхождения подстроки", desc_en: "Replace all occurrences of a substring", syntax: "=ПОДСТАВИТЬ(текст; старый; новый)", syntax_en: "=SUBSTITUTE(text, old, new)", example: "=ПОДСТАВИТЬ(A2;\"+7\";\"8\")", example_en: "=SUBSTITUTE(A2,\"+7\",\"8\")" },
        { cmd: "ПРОПИСН/СТРОЧН/ПРОПНАЧ (UPPER/LOWER/PROPER)", cmd_en: "UPPER/LOWER/PROPER", desc: "Верхний / нижний / как имя", desc_en: "Uppercase / lowercase / title case", syntax: "=ПРОПИСН(текст)\n=СТРОЧН(текст)\n=ПРОПНАЧ(текст)", syntax_en: "=UPPER(text)\n=LOWER(text)\n=PROPER(text)", example: "=ПРОПНАЧ(A2) → \"Иван Иванов\"", example_en: "=PROPER(A2) → \"John Smith\"" },
        { cmd: "ТЕКСТ (TEXT)", cmd_en: "TEXT", desc: "Число или дату в текстовом формате", desc_en: "Format a number or date as text", syntax: "=ТЕКСТ(значение; \"формат\")", syntax_en: "=TEXT(value, \"format\")", example: "=ТЕКСТ(A2;\"ДД.ММ.ГГГГ\")\n=ТЕКСТ(A2;\"# ##0,00 ₸\")", example_en: "=TEXT(A2,\"DD.MM.YYYY\")\n=TEXT(A2,\"#,##0.00\")" },
        { cmd: "ЗНАЧЕН (VALUE)", cmd_en: "VALUE", desc: "Текст в число", desc_en: "Convert text to number", syntax: "=ЗНАЧЕН(текст)", syntax_en: "=VALUE(text)", example: "=ЗНАЧЕН(ПОДСТАВИТЬ(A2;\" \";\"0\"))", example_en: "=VALUE(SUBSTITUTE(A2,\" \",\"0\"))" },
      ],
    },
    {
      category: "Дата и время", category_en: "Date & Time",
      items: [
        { cmd: "СЕГОДНЯ / ТДАТА (TODAY / NOW)", cmd_en: "TODAY / NOW", desc: "Текущая дата / дата+время", desc_en: "Current date / date+time", syntax: "=СЕГОДНЯ()\n=ТДАТА()", syntax_en: "=TODAY()\n=NOW()", example: "=A2-СЕГОДНЯ()  -- дней до даты", example_en: "=A2-TODAY()  -- days until date" },
        { cmd: "ГОД/МЕСЯЦ/ДЕНЬ (YEAR/MONTH/DAY)", cmd_en: "YEAR/MONTH/DAY", desc: "Извлечь часть даты", desc_en: "Extract part of a date", syntax: "=ГОД(дата)\n=МЕСЯЦ(дата)\n=ДЕНЬ(дата)", syntax_en: "=YEAR(date)\n=MONTH(date)\n=DAY(date)", example: "=ГОД(A2)\n=ТЕКСТ(A2;\"ММММ\")", example_en: "=YEAR(A2)\n=TEXT(A2,\"MMMM\")  -- month name" },
        { cmd: "РАЗНДАТ (DATEDIF)", cmd_en: "DATEDIF", desc: "Разница дат в годах/месяцах/днях", desc_en: "Difference between dates in years/months/days", syntax: "=РАЗНДАТ(начало;конец;\"Y\"/\"M\"/\"D\")", syntax_en: "=DATEDIF(start,end,\"Y\"/\"M\"/\"D\")", example: "=РАЗНДАТ(A2;СЕГОДНЯ();\"Y\")", example_en: "=DATEDIF(A2,TODAY(),\"Y\")  -- age in years" },
        { cmd: "ДАТА (DATE)", cmd_en: "DATE", desc: "Собрать дату из частей", desc_en: "Build a date from parts", syntax: "=ДАТА(год;месяц;день)", syntax_en: "=DATE(year,month,day)", example: "=ДАТА(ГОД(A2);МЕСЯЦ(A2);1)", example_en: "=DATE(YEAR(A2),MONTH(A2),1)  -- first day of month" },
        { cmd: "ДЕНЬНЕД (WEEKDAY)", cmd_en: "WEEKDAY", desc: "День недели. 2 = Пн=1 ... Вс=7", desc_en: "Day of week. 2 = Mon=1 ... Sun=7", syntax: "=ДЕНЬНЕД(дата;2)", syntax_en: "=WEEKDAY(date,2)", example: "=ЕСЛИ(ДЕНЬНЕД(A2;2)<6;\"Рабочий\";\"Выходной\")", example_en: "=IF(WEEKDAY(A2,2)<6,\"Workday\",\"Weekend\")" },
        { cmd: "РАБДЕНЬ (WORKDAY)", cmd_en: "WORKDAY", desc: "Дата через N рабочих дней", desc_en: "Date N working days from a date", syntax: "=РАБДЕНЬ(дата; дней)", syntax_en: "=WORKDAY(date, days)", example: "=РАБДЕНЬ(СЕГОДНЯ();5)", example_en: "=WORKDAY(TODAY(),5)" },
        { cmd: "ЧИСТРАБДНИ (NETWORKDAYS)", cmd_en: "NETWORKDAYS", desc: "Количество рабочих дней между датами", desc_en: "Number of working days between two dates", syntax: "=ЧИСТРАБДНИ(начало;конец)", syntax_en: "=NETWORKDAYS(start,end)", example: "=ЧИСТРАБДНИ(A2;B2)", example_en: "=NETWORKDAYS(A2,B2)" },
        { cmd: "КОНМЕСЯЦА (EOMONTH)", cmd_en: "EOMONTH", desc: "Последний день месяца", desc_en: "Last day of a month", syntax: "=КОНМЕСЯЦА(дата;месяцев)", syntax_en: "=EOMONTH(date,months)", example: "=КОНМЕСЯЦА(СЕГОДНЯ();0)", example_en: "=EOMONTH(TODAY(),0)  -- end of current month" },
      ],
    },
    {
      category: "Математика и статистика", category_en: "Math & Statistics",
      items: [
        { cmd: "ОКРУГЛ (ROUND/ROUNDUP/ROUNDDOWN)", cmd_en: "ROUND/ROUNDUP/ROUNDDOWN", desc: "Округление: обычное / вверх / вниз", desc_en: "Rounding: standard / up / down", syntax: "=ОКРУГЛ(число;знаков)\n=ОКРУГЛВВЕРХ(число;знаков)\n=ОКРУГЛВНИЗ(число;знаков)", syntax_en: "=ROUND(number,digits)\n=ROUNDUP(number,digits)\n=ROUNDDOWN(number,digits)", example: "=ОКРУГЛ(A2;2)\n=ОКРУГЛВВЕРХ(A2;0)", example_en: "=ROUND(A2,2)\n=ROUNDUP(A2,0)" },
        { cmd: "ЦЕЛОЕ / ОСТАТ (INT / MOD)", cmd_en: "INT / MOD", desc: "Целая часть / остаток от деления", desc_en: "Integer part / remainder of division", syntax: "=ЦЕЛОЕ(число)\n=ОСТАТ(число;делитель)", syntax_en: "=INT(number)\n=MOD(number,divisor)", example: "=ЦЕЛОЕ(3.9)   -- = 3\n=ОСТАТ(A2;2)  -- 0=чётное", example_en: "=INT(3.9)   -- = 3\n=MOD(A2,2)  -- 0=even" },
        { cmd: "ABS", desc: "Модуль — абсолютное значение без знака", desc_en: "Absolute value — without sign", syntax: "=ABS(число)", syntax_en: "=ABS(number)", example: "=ABS(A2-B2)", example_en: "=ABS(A2-B2)" },
        { cmd: "МАКС / МИН (MAX / MIN)", cmd_en: "MAX / MIN", desc: "Максимум и минимум", desc_en: "Maximum and minimum", syntax: "=МАКС(диапазон)\n=МИН(диапазон)", syntax_en: "=MAX(range)\n=MIN(range)", example: "=МАКС(B2:B100)", example_en: "=MAX(B2:B100)" },
        { cmd: "НАИБОЛЬШИЙ / НАИМЕНЬШИЙ (LARGE / SMALL)", cmd_en: "LARGE / SMALL", desc: "k-й по величине элемент", desc_en: "k-th largest / smallest value", syntax: "=НАИБОЛЬШИЙ(диапазон;k)\n=НАИМЕНЬШИЙ(диапазон;k)", syntax_en: "=LARGE(range,k)\n=SMALL(range,k)", example: "=НАИБОЛЬШИЙ(B2:B100;2)", example_en: "=LARGE(B2:B100,2)  -- 2nd largest" },
        { cmd: "РАНГ (RANK)", cmd_en: "RANK", desc: "Ранг числа в диапазоне. 0=убывание", desc_en: "Rank of a number in a range. 0=descending", syntax: "=РАНГ(число;диапазон;0)", syntax_en: "=RANK(number,range,0)", example: "=РАНГ(B2;$B$2:$B$100;0)", example_en: "=RANK(B2,$B$2:$B$100,0)" },
        { cmd: "ПРОЦЕНТИЛЬ (PERCENTILE)", cmd_en: "PERCENTILE", desc: "k-й процентиль. k от 0 до 1", desc_en: "k-th percentile. k from 0 to 1", syntax: "=ПРОЦЕНТИЛЬ(диапазон;k)", syntax_en: "=PERCENTILE(range,k)", example: "=ПРОЦЕНТИЛЬ(B2:B100;0.9)", example_en: "=PERCENTILE(B2:B100,0.9)  -- 90th percentile" },
      ],
    },
  ],

  "Google Sheets": [
    {
      category: "Эксклюзивные функции", category_en: "Exclusive Functions",
      items: [
        { cmd: "FILTER", desc: "Фильтровать диапазон по условию. Возвращает массив строк", desc_en: "Filter a range by condition. Returns an array of matching rows", syntax: "=FILTER(диапазон; условие1; условие2)", example: "=FILTER(A2:C100; B2:B100>50)\n=FILTER(A2:C100; A2:A100=\"Алматы\"; C2:C100>0)" },
        { cmd: "SORT", desc: "Сортировать диапазон. ИСТИНА=ASC, ЛОЖЬ=DESC", desc_en: "Sort a range. TRUE=ASC, FALSE=DESC", syntax: "=SORT(диапазон; столбец; по_возрастанию)", example: "=SORT(A2:B100; 2; FALSE)" },
        { cmd: "UNIQUE", desc: "Уникальные строки из диапазона", desc_en: "Unique rows from a range", syntax: "=UNIQUE(диапазон)", example: "=UNIQUE(A2:A100)" },
        { cmd: "SEQUENCE", desc: "Создать числовой ряд", desc_en: "Generate a numeric sequence", syntax: "=SEQUENCE(строки; столбцы; начало; шаг)", example: "=SEQUENCE(10)\n=SEQUENCE(10;1;0;2)\n=SEQUENCE(5;3;1;1)" },
        { cmd: "FLATTEN", desc: "Преобразовать диапазон в один столбец", desc_en: "Convert a range into a single column", syntax: "=FLATTEN(диапазон)", example: "=FLATTEN(A1:C10)" },
        { cmd: "TOCOL / TOROW", desc: "Преобразовать в столбец / строку", desc_en: "Convert to a column / row. 1=ignore blanks", syntax: "=TOCOL(диапазон; игнор_пустых)\n=TOROW(диапазон; игнор_пустых)", example: "=TOCOL(A1:C5; 1)" },
      ],
    },
    {
      category: "Поиск и ссылки", category_en: "Lookup & Reference",
      items: [
        { cmd: "XLOOKUP", desc: "Современная замена VLOOKUP. Ищет в любую сторону", desc_en: "Modern replacement for VLOOKUP. Searches in any direction", syntax: "=XLOOKUP(что_ищем; где_ищем; что_вернуть; если_нет)", example: "=XLOOKUP(A2;D2:D100;E2:E100;\"Не найдено\")" },
        { cmd: "VLOOKUP", desc: "Вертикальный поиск. FALSE = точное совпадение", desc_en: "Vertical lookup. FALSE = exact match", syntax: "=VLOOKUP(что_ищем; таблица; номер_столбца; FALSE)", example: "=VLOOKUP(A2;$D$2:$F$100;2;FALSE)" },
        { cmd: "INDEX+MATCH", desc: "Мощная замена VLOOKUP — работает в обоих направлениях", desc_en: "Powerful alternative to VLOOKUP — works in both directions", syntax: "=INDEX(столбец_результата;\n  MATCH(значение; столбец_поиска; 0))", example: "=INDEX(E2:E100;MATCH(A2;D2:D100;0))" },
        { cmd: "IMPORTRANGE", desc: "Импортировать данные из другого Google Sheets файла", desc_en: "Import data from another Google Sheets file", syntax: "=IMPORTRANGE(\"file_url\"; \"Sheet!A1:D100\")", example: "=IMPORTRANGE(\"https://docs.google.com/...\"; \"Data!A:D\")" },
        { cmd: "QUERY", desc: "SQL-подобные запросы прямо в ячейке — мощнейший инструмент Sheets", desc_en: "SQL-like queries directly in a cell — the most powerful Sheets feature", syntax: "=QUERY(range; \"SELECT ... WHERE ... ORDER BY ...\")", example: "=QUERY(A1:D100;\n  \"SELECT A, C, COUNT(B)\n   WHERE D > 100\n   GROUP BY A, C\n   ORDER BY COUNT(B) DESC\n   LABEL COUNT(B) 'Count'\")" },
        { cmd: "INDIRECT", desc: "Ссылка из текстовой строки", desc_en: "Reference from a text string", syntax: "=INDIRECT(\"reference_as_text\")", example: "=INDIRECT(\"A\"&B2)\n=INDIRECT(\"Sheet\"&C1&\"!A1\")" },
      ],
    },
    {
      category: "Условия и логика", category_en: "Conditions & Logic",
      items: [
        { cmd: "IF", desc: "Базовое условие", desc_en: "Basic condition", syntax: "=IF(condition, if_true, if_false)", example: "=IF(A2>100,\"Many\",\"Few\")" },
        { cmd: "IFS", desc: "Множественные условия без вложенности", desc_en: "Multiple conditions without nesting", syntax: "=IFS(cond1,val1,cond2,val2,TRUE,default)", example: "=IFS(A2>90,\"A\",A2>70,\"B\",TRUE,\"C\")" },
        { cmd: "IFERROR / IFNA", desc: "Обработать ошибки. IFNA — только #N/A", desc_en: "Handle errors. IFNA catches only #N/A", syntax: "=IFERROR(formula, value)\n=IFNA(formula, value)", example: "=IFERROR(VLOOKUP(A2,D:E,2,FALSE),\"Not found\")" },
        { cmd: "SWITCH", desc: "Сравнение на равенство — чище IFS для фиксированных значений", desc_en: "Equality check — cleaner than IFS for fixed values", syntax: "=SWITCH(value, case1, res1, case2, res2, default)", example: "=SWITCH(A2,1,\"Jan\",2,\"Feb\",3,\"Mar\",\"Other\")" },
        { cmd: "AND / OR / NOT", desc: "Логические операторы", desc_en: "Logical operators", syntax: "=AND(cond1,cond2)\n=OR(cond1,cond2)\n=NOT(condition)", example: "=IF(AND(A2>18,B2=\"M\"),\"Yes\",\"No\")" },
      ],
    },
    {
      category: "Подсчёт и суммирование", category_en: "Counting & Summation",
      items: [
        { cmd: "COUNTIF / COUNTIFS", desc: "Считать по условиям", desc_en: "Count by conditions", syntax: "=COUNTIF(range, criteria)\n=COUNTIFS(r1,c1,r2,c2)", example: "=COUNTIF(B2:B100,\">50\")\n=COUNTIFS(A2:A100,\"M\",B2:B100,\">25\")" },
        { cmd: "SUMIF / SUMIFS", desc: "Сумма по условиям", desc_en: "Sum by conditions", syntax: "=SUMIF(range, criteria, sum_range)\n=SUMIFS(sum_range,r1,c1,r2,c2)", example: "=SUMIFS(D2:D100,A2:A100,\"KZ\",B2:B100,2024)" },
        { cmd: "SUBTOTAL", desc: "Считает только видимые строки после фильтра", desc_en: "Counts only visible rows after filtering", syntax: "=SUBTOTAL(num, range)\n9=SUM, 3=COUNTA, 1=AVERAGE", example: "=SUBTOTAL(9,C2:C100)" },
        { cmd: "SUMPRODUCT", desc: "Сумма произведений. Заменяет SUMIFS для сложных условий", desc_en: "Sum of products. Replaces SUMIFS for complex conditions", syntax: "=SUMPRODUCT(array1, array2)", example: "=SUMPRODUCT((A2:A100=\"KZ\")*(B2:B100>0)*C2:C100)" },
      ],
    },
    {
      category: "Текст", category_en: "Text",
      items: [
        { cmd: "CONCATENATE / &", desc: "Склеить строки", desc_en: "Concatenate strings", syntax: "=CONCATENATE(A1,\" \",B1)\n=A1&\" \"&B1", example: "=A2&\" \"&B2" },
        { cmd: "JOIN", desc: "Склеить диапазон с разделителем", desc_en: "Join a range with a delimiter", syntax: "=JOIN(delimiter, range)", example: "=JOIN(\", \",A2:A10)" },
        { cmd: "SPLIT", desc: "Разбить строку по разделителю в несколько ячеек", desc_en: "Split a string into multiple cells by delimiter", syntax: "=SPLIT(text, delimiter)", example: "=SPLIT(A2,\",\")" },
        { cmd: "REGEXEXTRACT", desc: "Извлечь подстроку по регулярному выражению", desc_en: "Extract a substring using a regular expression", syntax: "=REGEXEXTRACT(text, \"pattern\")", example: "=REGEXEXTRACT(A2,\"\\d+\")  -- first number" },
        { cmd: "REGEXMATCH", desc: "Проверить совпадение — ИСТИНА/ЛОЖЬ", desc_en: "Check for a pattern match — TRUE/FALSE", syntax: "=REGEXMATCH(text, \"pattern\")", example: "=REGEXMATCH(A2,\"^\\+7\")  -- starts with +7" },
        { cmd: "REGEXREPLACE", desc: "Заменить по регулярному выражению", desc_en: "Replace using a regular expression", syntax: "=REGEXREPLACE(text, \"pattern\", replacement)", example: "=REGEXREPLACE(A2,\"\\s+\",\" \")" },
        { cmd: "LEN / LEFT / RIGHT / MID", desc: "Стандартные текстовые функции", desc_en: "Standard text functions", syntax: "=LEN(text)\n=LEFT(text,n)\n=RIGHT(text,n)\n=MID(text,start,count)", example: "=LEFT(A2,3)\n=MID(A2,3,5)" },
        { cmd: "TRIM / UPPER / LOWER / PROPER", desc: "Пробелы и регистр", desc_en: "Whitespace and case", syntax: "=TRIM(text)\n=UPPER(text)\n=LOWER(text)\n=PROPER(text)", example: "=PROPER(A2)  -- John Smith" },
        { cmd: "TEXT", desc: "Число или дату в текстовом формате", desc_en: "Format a number or date as text", syntax: "=TEXT(value, \"format\")", example: "=TEXT(A2,\"DD.MM.YYYY\")" },
      ],
    },
    {
      category: "Дата и время", category_en: "Date & Time",
      items: [
        { cmd: "TODAY / NOW", desc: "Текущая дата / дата+время", desc_en: "Current date / date+time", syntax: "=TODAY()\n=NOW()", example: "=A2-TODAY()  -- days until event" },
        { cmd: "YEAR/MONTH/DAY", desc: "Извлечь часть даты", desc_en: "Extract part of a date", syntax: "=YEAR(date)\n=MONTH(date)\n=DAY(date)", example: "=YEAR(A2)" },
        { cmd: "DATEDIF", desc: "Разница дат в годах/месяцах/днях", desc_en: "Difference between dates in years/months/days", syntax: "=DATEDIF(start,end,\"Y\"/\"M\"/\"D\")", example: "=DATEDIF(A2,TODAY(),\"Y\")  -- age" },
        { cmd: "DATE / DATEVALUE", desc: "Создать дату из частей / из текста", desc_en: "Build a date from parts / parse from text", syntax: "=DATE(year,month,day)\n=DATEVALUE(\"01.01.2024\")", example: "=DATE(YEAR(A2),MONTH(A2),1)  -- first day of month" },
        { cmd: "WEEKDAY / WEEKNUM", desc: "День недели / номер недели в году", desc_en: "Day of week / week number of the year", syntax: "=WEEKDAY(date,2)\n=WEEKNUM(date,2)", example: "=IF(WEEKDAY(A2,2)<6,\"Workday\",\"Weekend\")" },
        { cmd: "WORKDAY / NETWORKDAYS", desc: "Дата через N рабочих дней / кол-во рабочих дней", desc_en: "Date N working days ahead / count working days between dates", syntax: "=WORKDAY(date,days)\n=NETWORKDAYS(start,end)", example: "=WORKDAY(TODAY(),5)\n=NETWORKDAYS(A2,B2)" },
        { cmd: "EOMONTH", desc: "Последний день месяца", desc_en: "Last day of a month", syntax: "=EOMONTH(date,months)", example: "=EOMONTH(TODAY(),0)  -- end of current month" },
      ],
    },
    {
      category: "QUERY — SQL в Sheets", category_en: "QUERY — SQL in Sheets",
      items: [
        { cmd: "QUERY SELECT", desc: "Выбрать нужные столбцы. Столбцы — буквами A, B, C...", desc_en: "Select specific columns. Columns referenced by letter (A, B, C...)", syntax: "=QUERY(data, \"SELECT A, B, C\")", example: "=QUERY(A1:D100, \"SELECT A, C, D\")" },
        { cmd: "QUERY WHERE", desc: "Фильтрация строк", desc_en: "Filter rows", syntax: "=QUERY(data, \"SELECT * WHERE B > 100\")", example: "=QUERY(A1:D100,\n  \"SELECT * WHERE C = 'Almaty' AND D > 0\")" },
        { cmd: "QUERY ORDER BY", desc: "Сортировка результата", desc_en: "Sort results", syntax: "=QUERY(data, \"SELECT * ORDER BY B DESC\")", example: "=QUERY(A1:D100,\n  \"SELECT A, B ORDER BY B DESC LIMIT 10\")" },
        { cmd: "QUERY GROUP BY", desc: "Группировка и агрегация", desc_en: "Grouping and aggregation", syntax: "=QUERY(data, \"SELECT A, COUNT(B) GROUP BY A\")", example: "=QUERY(A1:D100,\n  \"SELECT A, SUM(C), COUNT(B)\n   GROUP BY A\n   ORDER BY SUM(C) DESC\")" },
        { cmd: "QUERY LABEL", desc: "Переименовать заголовки агрегированных столбцов", desc_en: "Rename headers of aggregated columns", syntax: "...\"LABEL COUNT(B) 'Count', SUM(C) 'Total'\"", example: "=QUERY(A1:D100,\n  \"SELECT A, COUNT(B), SUM(C)\n   GROUP BY A\n   LABEL COUNT(B) 'Orders', SUM(C) 'Revenue'\")" },
        { cmd: "QUERY + FILTER", desc: "Комбинировать FILTER и QUERY", desc_en: "Combine FILTER and QUERY for complex tasks", syntax: "=QUERY(FILTER(A1:D100,D1:D100>0),\n  \"SELECT * ORDER BY Col2 DESC\")", example: "=QUERY(\n  FILTER(A1:D100,B1:B100=\"active\"),\n  \"SELECT Col1, Col3 ORDER BY Col3 DESC LIMIT 5\"\n)" },
      ],
    },
  ],
};

const TABS = ["SQL", "Excel", "Google Sheets"];
const accent = { SQL: "#4ECDC4", Excel: "#43D9AD", "Google Sheets": "#4A9EFF" };

export default function App() {
  const [tab, setTab] = useState("SQL");
  const [lang, setLang] = useState("ru");
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState(null);

  const color = accent[tab];
  const categories = data[tab];
  const u = ui[lang];

  const filtered = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (!search) return true;
      const s = search.toLowerCase();
      const cmd = L(item, "cmd", lang).toLowerCase();
      const desc = L(item, "desc", lang).toLowerCase();
      const ex = L(item, "example", lang).toLowerCase();
      return cmd.includes(s) || desc.includes(s) || ex.includes(s);
    }),
  })).filter(cat => cat.items.length > 0);

  const total = categories.reduce((acc, c) => acc + c.items.length, 0);
  const found = filtered.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div style={{ background: "#0C0C14", minHeight: "100vh", fontFamily: "monospace", color: "#D0D0D0", padding: "20px 14px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#555", textTransform: "uppercase", marginBottom: 6 }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>SQL · Excel · Google Sheets</h1>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(""); setOpenItem(null); }}
              style={{ background: tab === t ? accent[t] : "#161622", border: `1px solid ${tab === t ? accent[t] : "#2A2A3A"}`, color: tab === t ? "#000" : "#888", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>
              {t}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#444", marginRight: 8 }}>
              {search ? `${found} ${u.of} ${total}` : `${total} ${u.commands}`}
            </div>
            {["ru", "en"].map(l => (
              <button key={l} onClick={() => { setLang(l); setOpenItem(null); }}
                style={{ background: lang === l ? "#FFFFFF" : "#161622", border: `1px solid ${lang === l ? "#FFFFFF" : "#2A2A3A"}`, color: lang === l ? "#000" : "#666", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <input value={search} onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
          placeholder={u.search}
          style={{ width: "100%", background: "#161622", border: `1px solid ${search ? color : "#2A2A3A"}`, borderRadius: 8, padding: "10px 14px", color: "#D0D0D0", fontSize: 12, fontFamily: "monospace", marginBottom: 20, outline: "none", boxSizing: "border-box" }} />

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", fontSize: 12, marginTop: 60 }}>{u.notFound}</div>
        )}

        {filtered.map(cat => (
          <div key={cat.category} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>
              {lang === "en" && cat.category_en ? cat.category_en : cat.category}
              <span style={{ color: "#333", letterSpacing: 0 }}> ({cat.items.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {cat.items.map(item => {
                const key = `${tab}-${item.cmd}`;
                const isOpen = openItem === key;
                const cmdText = L(item, "cmd", lang);
                const descText = L(item, "desc", lang);
                const syntaxText = L(item, "syntax", lang);
                const exampleText = L(item, "example", lang);
                return (
                  <div key={key} onClick={() => setOpenItem(isOpen ? null : key)}
                    style={{ background: isOpen ? "#1A1A28" : "#161622", border: `1px solid ${isOpen ? color + "50" : "#252535"}`, borderRadius: 8, padding: "11px 14px", cursor: "pointer", transition: "all 0.12s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", overflow: "hidden" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 140, flexShrink: 0 }}>{cmdText}</span>
                        <span style={{ fontSize: 11, color: "#909090", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{descText}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "#444", marginLeft: 10, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E2E" }}>
                        <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{u.syntax}</div>
                        <div style={{ background: "#0A0A12", borderRadius: 6, padding: "9px 12px", fontSize: 11, color: "#AAAAAA", marginBottom: 10, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{syntaxText}</div>
                        <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{u.example}</div>
                        <div style={{ background: "#0A0A12", borderRadius: 6, padding: "9px 12px", fontSize: 11, color, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{exampleText}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}