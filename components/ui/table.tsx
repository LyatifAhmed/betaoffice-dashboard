import * as React from "react";

type TableProps = {
  children: React.ReactNode;
};

export const Table = ({ children }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border text-sm text-left">{children}</table>
  </div>
);

export const TableHeader = ({ children }: TableProps) => (
  <thead className="bg-gray-100 text-xs font-semibold uppercase">{children}</thead>
);

export const TableBody = ({ children }: TableProps) => (
  <tbody className="divide-y">{children}</tbody>
);

export const TableRow = ({ children }: TableProps) => <tr>{children}</tr>;

export const TableCell = ({ children }: TableProps) => (
  <td className="px-4 py-2">{children}</td>
);

export const TableHead = ({ children }: TableProps) => (
  <th className="px-4 py-2 text-left">{children}</th>
);
