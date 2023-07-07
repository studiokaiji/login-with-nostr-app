export const OutlinedButton = (
  props: JSX.IntrinsicElements["button"] & { isProcessing?: boolean }
) => {
  return (
    <button
      {...props}
      className={`flex cursor-pointer items-center rounded-full border-2 px-3 py-1 font-medium text-orange-500 ${
        props.isProcessing || props.disabled
          ? "border-orange-300"
          : "border-orange-500 hover:bg-orange-200"
      } ${props.className}`}
      disabled={props.disabled || props.isProcessing}
    >
      <div
        className={`mr-2 h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent ${
          props.isProcessing ? "visible" : "hidden"
        }`}
      ></div>
      <span> {props.children}</span>
    </button>
  );
};
