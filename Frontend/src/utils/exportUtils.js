/**
 * Converts an array of transaction objects to CSV format and triggers a download.
 * @param {Array} transactions - The list of transactions to export.
 * @param {string} filename - The name of the file to download.
 */
export const exportTransactionsToCSV = (transactions, filename = "transactions.csv") => {
	if (!transactions || transactions.length === 0) return;

	const headers = ["Reference", "Date", "Description", "Category", "Type", "Amount", "Status"];
	const rows = transactions.map((t) => [
		t.reference,
		new Date(t.createdAt).toLocaleDateString(),
		t.description,
		t.category,
		t.type.toUpperCase(),
		t.amount,
		t.status
	]);

	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
