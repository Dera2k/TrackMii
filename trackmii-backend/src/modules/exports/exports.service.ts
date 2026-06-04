import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Workbook } from "exceljs";
import { Expense } from "../expenses/expense.entity";
import { Budget } from "../budgets/budget.entity";
import { ExportQueryDto } from "./dtos/export-query.dto";

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
  ) {}

  //main export handler that builds workbook with selected sections
  async exportToXlsx(userId: string, query: ExportQueryDto): Promise<Buffer> {
    const dateRange = this.getDateRange(query.preset, query.start_date, query.end_date);
    const expenses = await this.getFilteredExpenses(userId, dateRange);

    const workbook = new Workbook();

    //add sheets if selected or default to all
    if (query.sections?.includes("summary") || !query.sections) {
      await this.addSummarySheet(workbook, userId, expenses, dateRange);
    }
    if (query.sections?.includes("insights") || !query.sections) {
      this.addInsightsSheet(workbook, expenses);
    }
    if (query.sections?.includes("categories") || !query.sections) {
      this.addCategoryBreakdownSheet(workbook, expenses);
    }
    if (query.sections?.includes("payment") || !query.sections) {
      this.addPaymentMethodSheet(workbook, expenses);
    }
    if (query.sections?.includes("weekday") || !query.sections) {
      this.addWeekdaySheet(workbook, expenses);
    }
    if (query.sections?.includes("topExpenses") || !query.sections) {
      this.addTopExpensesSheet(workbook, expenses);
    }
    if (query.sections?.includes("monthly") || !query.sections) {
      this.addMonthlyTrendsSheet(workbook, userId);
    }
    if (query.sections?.includes("budget") || !query.sections) {
      await this.addBudgetPerformanceSheet(workbook, userId, expenses);
    }
    if (query.sections?.includes("details") || !query.sections) {
      this.addExpenseDetailsSheet(workbook, expenses);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  //convert preset or custom dates to date range
  private getDateRange(preset?: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (startDate && endDate) {
      return { start: new Date(startDate), end: new Date(endDate) };
    }

    const getRangeStart = (daysBack: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysBack);
      return d;
    };

    switch (preset) {
      case "last3days":
        return { start: getRangeStart(3), end: today };
      case "last5days":
        return { start: getRangeStart(5), end: today };
      case "last7days":
        return { start: getRangeStart(7), end: today };
      case "last30days":
        return { start: getRangeStart(30), end: today };
      case "thisMonth":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: today,
        };
      case "last3months":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
          end: today,
        };
      case "last6months":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
          end: today,
        };
      case "lastYear":
        return {
          start: new Date(now.getFullYear() - 1, now.getMonth(), 1),
          end: today,
        };
      default:
        return { start: getRangeStart(30), end: today };
    }
  }

  //query expenses within date range
  private async getFilteredExpenses(userId: string, dateRange: { start: Date; end: Date }): Promise<Expense[]> {
    return this.expenseRepo
      .createQueryBuilder("expense")
      .leftJoinAndSelect("expense.category", "category")
      .where("expense.user_id = :userId", { userId })
      .andWhere("expense.is_deleted = false")
      .andWhere("expense.expense_date BETWEEN :start AND :end", {
        start: dateRange.start.toISOString().split("T")[0],
        end: dateRange.end.toISOString().split("T")[0],
      })
      .orderBy("expense.expense_date", "DESC")
      .getMany();
  }

  //high-level overview stats
  private async addSummarySheet(workbook: Workbook, userId: string, expenses: Expense[], dateRange: any) {
    const sheet = workbook.addWorksheet("Summary");
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    const avgDaily = totalSpent / ((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24) + 1);
    const topCategory = this.getTopCategory(expenses);

    const budget = await this.budgetRepo.findOne({
      where: { user_id: userId, category_id: IsNull(), month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    });

    sheet.addRow(["EXPENSE SUMMARY"]);
    sheet.addRow([`Generated: ${new Date().toLocaleDateString()}`]);
    sheet.addRow([]);
    sheet.addRow(["Total Spent", `${totalSpent.toFixed(2)}`]);
    sheet.addRow(["Daily Average", `${avgDaily.toFixed(2)}`]);
    sheet.addRow(["Top Category", topCategory?.category_name || "N/A"]);
    if (budget) {
  const budgetAmount = parseFloat(budget.amount.toString());

  sheet.addRow([
    "Budget Usage",
    `${budgetAmount > 0 ? Math.round((totalSpent / budgetAmount) * 100) : 0}%`,
  ]);
}

    sheet.columns = [{ width: 30 }, { width: 20 }];
  }

  //spending patterns and insights
  private addInsightsSheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Insights");
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    const avgDaily = totalSpent / 30;
    const avgWeekly = totalSpent / 4.3;
    const topCategory = this.getTopCategory(expenses);
    const biggest = expenses.reduce((max, e) => (parseFloat(e.amount.toString()) > max.amount ? { ...e, amount: parseFloat(e.amount.toString()) } : max), { amount: 0 } as any);

    sheet.addRow(["SPENDING INSIGHTS"]);
    sheet.addRow([]);
    sheet.addRow(["Daily Average", `${avgDaily.toFixed(2)}`]);
    sheet.addRow(["Weekly Average", `${avgWeekly.toFixed(2)}`]);
    sheet.addRow(["Biggest Expense", `${biggest.title} - ${biggest.amount.toFixed(2)}`]);
    sheet.addRow(["Most Frequent Category", topCategory?.category_name || "N/A"]);

    sheet.columns = [{ width: 30 }, { width: 20 }];
  }

  //breakdown by category with percentages
  private addCategoryBreakdownSheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Categories");
    const categories = this.groupByCategory(expenses);
    const total = categories.reduce((sum, c) => sum + c.amount, 0);

    sheet.addRow(["SPENDING BY CATEGORY"]);
    sheet.addRow(["Category", "Amount", "Percentage"]);

    categories.forEach((c) => {
      const pct = total > 0 ? ((c.amount / total) * 100).toFixed(1) : "0";
      sheet.addRow([c.category_name, c.amount.toFixed(2), `${pct}%`]);
    });

    sheet.columns = [{ width: 25 }, { width: 15 }, { width: 15 }];
  }

  //how much spent per payment method
  private addPaymentMethodSheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Payment Methods");
    const methods = this.groupByPaymentMethod(expenses);

    sheet.addRow(["SPENDING BY PAYMENT METHOD"]);
    sheet.addRow(["Payment Method", "Amount", "Count"]);

    methods.forEach((m) => {
      sheet.addRow([m.method, m.amount.toFixed(2), m.count]);
    });

    sheet.columns = [{ width: 25 }, { width: 15 }, { width: 15 }];
  }

  //which days of the week have most spending
  private addWeekdaySheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Weekday Patterns");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdaySpending = Array(7).fill(0);
    const weekdayCount = Array(7).fill(0);

    expenses.forEach((e) => {
      const day = new Date(e.expense_date).getDay();
      weekdaySpending[day] += parseFloat(e.amount.toString());
      weekdayCount[day]++;
    });

    sheet.addRow(["SPENDING BY WEEKDAY"]);
    sheet.addRow(["Day", "Total Spent", "Count", "Average"]);

    days.forEach((day, i) => {
      const avg = weekdayCount[i] > 0 ? weekdaySpending[i] / weekdayCount[i] : 0;
      sheet.addRow([day, weekdaySpending[i].toFixed(2), weekdayCount[i], avg.toFixed(2)]);
    });

    sheet.columns = [{ width: 15 }, { width: 15 }, { width: 10 }, { width: 15 }];
  }

  // Top 5 individual transactions
  private addTopExpensesSheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Top 5 Expenses");
    const top5 = [...expenses]
  .sort((a, b) => parseFloat(b.amount.toString()) - parseFloat(a.amount.toString()))
  .slice(0, 5);

    sheet.addRow(["TOP 5 EXPENSES"]);
    sheet.addRow(["Date", "Title", "Category", "Amount"]);

    top5.forEach((e) => {
      sheet.addRow([
        new Date(e.expense_date).toLocaleDateString(),
        e.title,
        e.category?.name || "Uncategorized",
        parseFloat(e.amount.toString()).toFixed(2),
      ]);
    });

    sheet.columns = [{ width: 15 }, { width: 25 }, { width: 20 }, { width: 15 }];
  }

  // Monthly trend over time
  private async addMonthlyTrendsSheet(workbook: Workbook, userId: string) {
    const sheet = workbook.addWorksheet("Monthly Trends");
    const results = await this.expenseRepo
      .createQueryBuilder("expense")
      .select("YEAR(expense.expense_date)", "year")
      .addSelect("MONTH(expense.expense_date)", "month")
      .addSelect("SUM(expense.amount)", "total")
      .where("expense.user_id = :userId", { userId })
      .andWhere("expense.is_deleted = false")
      .groupBy("year, month")
      .orderBy("year, month")
      .getRawMany();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sheet.addRow(["MONTHLY TRENDS (Last 6 Months)"]);
    sheet.addRow(["Month", "Spent"]);

    results.slice(-6).forEach((r) => {
      sheet.addRow([`${monthNames[r.month - 1]} ${r.year}`, parseFloat(r.total).toFixed(2)]);
    });

    sheet.columns = [{ width: 20 }, { width: 15 }];
  }

  // Budget vs actual spending
  private async addBudgetPerformanceSheet(workbook: Workbook, userId: string, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Budget Performance");
    const budgets = await this.budgetRepo.find({ where: { user_id: userId }, relations: ["category"] });

    sheet.addRow(["BUDGET vs ACTUAL"]);
    sheet.addRow(["Category", "Budget", "Spent", "Usage %"]);

    budgets.forEach((b) => {
      const categoryExpenses = expenses.filter((e) => e.category_id === b.category_id);
      const spent = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
      const budgetAmount = parseFloat(b.amount.toString());
const usage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      const categoryName = b.category?.name || "Overall";

      sheet.addRow([categoryName, parseFloat(b.amount.toString()).toFixed(2), spent.toFixed(2), `${usage}%`]);
    });

    sheet.columns = [{ width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }];
  }

  // Full transaction list
  private addExpenseDetailsSheet(workbook: Workbook, expenses: Expense[]) {
    const sheet = workbook.addWorksheet("Expense Details");

    sheet.addRow(["DATE", "TITLE", "CATEGORY", "AMOUNT", "PAYMENT METHOD", "NOTE"]);

    expenses.forEach((e) => {
      sheet.addRow([
        new Date(e.expense_date).toLocaleDateString(),
        e.title,
        e.category?.name || "Uncategorized",
        parseFloat(e.amount.toString()).toFixed(2),
        e.payment_method,
        e.note || "",
      ]);
    });

    sheet.columns = [{ width: 15 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 18 }, { width: 30 }];
  }

  // Get single top category from list
  private getTopCategory(expenses: Expense[]) {
    return this.groupByCategory(expenses).sort((a, b) => b.amount - a.amount)[0];
  }

  // Group expenses by category
  private groupByCategory(expenses: Expense[]) {
    const grouped = expenses.reduce(
      (acc, e) => {
        if (!e.category_id) return acc;
        const existing = acc.find((c) => c.category_id === e.category_id);
        if (existing) {
          existing.amount += parseFloat(e.amount.toString());
        } else {
          acc.push({
            category_id: e.category_id,
            category_name: e.category?.name || "N/A",
            amount: parseFloat(e.amount.toString()),
          });
        }
        return acc;
      },
      [] as Array<{ category_id: string; category_name: string; amount: number }>
    );
    return grouped;
  }

  // Group expenses by payment method
  private groupByPaymentMethod(expenses: Expense[]) {
    const grouped = expenses.reduce(
      (acc, e) => {
        const existing = acc.find((m) => m.method === e.payment_method);
        if (existing) {
          existing.amount += parseFloat(e.amount.toString());
          existing.count++;
        } else {
          acc.push({
            method: e.payment_method,
            amount: parseFloat(e.amount.toString()),
            count: 1,
          });
        }
        return acc;
      },
      [] as Array<{ method: string; amount: number; count: number }>
    );
    return grouped.sort((a, b) => b.amount - a.amount);
  }
}