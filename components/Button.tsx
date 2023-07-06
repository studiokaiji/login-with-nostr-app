export const Button = (
  props: JSX.IntrinsicElements["button"] & { isProcessing?: boolean }
) => {
  return (
    <button
      {...props}
      className={`flex cursor-pointer items-center rounded-full border-2 px-5 py-2 font-medium text-white ${
        props.isProcessing || props.disabled
          ? "border-orange-300 bg-orange-300"
          : "border-orange-500 bg-orange-500 hover:bg-orange-400"
      } ${props.className}`}
      disabled={props.disabled || props.isProcessing}
    >
      <div
        className={`mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent ${
          props.isProcessing ? "visible" : "hidden"
        }`}
      ></div>
      <span> {props.children}</span>
    </button>
  );
};
