interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex justify-center">
      <div className="px-3 py-1 bg-neutral-200 rounded-full text-xs text-neutral-500">
        {date}
      </div>
    </div>
  );
}
