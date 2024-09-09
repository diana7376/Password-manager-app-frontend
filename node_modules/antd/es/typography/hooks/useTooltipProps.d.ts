import type { TooltipProps } from '../../tooltip';
declare const useTooltipProps: (tooltip: React.ReactNode | TooltipProps, editConfigText: React.ReactNode, children: React.ReactNode) => {
    type: string | import("react").JSXElementConstructor<any>;
    props: any;
    key: string | null;
    title: import("react").ReactNode;
} | {
    [Symbol.iterator](): Iterator<import("react").ReactNode, any, undefined>;
    title: import("react").ReactNode;
} | {
    title: import("react").ReactNode | import("../../_util/getRenderPropValue").RenderFunction;
    overlay?: import("react").ReactNode | import("../../_util/getRenderPropValue").RenderFunction;
    style?: import("react").CSSProperties;
    className?: string;
    rootClassName?: string;
    color?: import("../../_util/type").LiteralUnion<import("../../_util/colors").PresetColorType>;
    placement?: import("../../tooltip").TooltipPlacement;
    builtinPlacements?: typeof import("rc-tooltip/lib/placements").placements;
    openClassName?: string;
    arrowPointAtCenter?: boolean;
    arrow?: boolean | {
        arrowPointAtCenter?: boolean;
        pointAtCenter?: boolean;
    };
    autoAdjustOverflow?: boolean | import("../../tooltip").AdjustOverflow;
    getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
    children?: import("react").ReactNode;
    destroyTooltipOnHide?: boolean | {
        keepParent?: boolean;
    };
    open?: import("rc-tooltip/lib/Tooltip").TooltipProps["visible"];
    defaultOpen?: import("rc-tooltip/lib/Tooltip").TooltipProps["defaultVisible"];
    onOpenChange?: import("rc-tooltip/lib/Tooltip").TooltipProps["onVisibleChange"];
    afterOpenChange?: import("rc-tooltip/lib/Tooltip").TooltipProps["afterVisibleChange"];
    visible?: import("rc-tooltip/lib/Tooltip").TooltipProps["visible"];
    defaultVisible?: import("rc-tooltip/lib/Tooltip").TooltipProps["defaultVisible"];
    onVisibleChange?: import("rc-tooltip/lib/Tooltip").TooltipProps["onVisibleChange"];
    afterVisibleChange?: import("rc-tooltip/lib/Tooltip").TooltipProps["afterVisibleChange"];
    zIndex?: number | undefined;
    animation?: import("@rc-component/trigger/lib/interface").AnimationType | undefined;
    motion?: import("@rc-component/trigger").TriggerProps["popupMotion"];
    prefixCls?: string | undefined;
    align?: import("@rc-component/trigger").AlignType | undefined;
    id?: string | undefined;
    forceRender?: boolean | undefined;
    mouseEnterDelay?: number | undefined;
    mouseLeaveDelay?: number | undefined;
    onPopupAlign?: ((element: HTMLElement, align: import("@rc-component/trigger").AlignType) => void) | undefined;
    transitionName?: string | undefined;
    overlayClassName?: string | undefined;
    overlayStyle?: import("react").CSSProperties | undefined;
    trigger?: (import("@rc-component/trigger").ActionType | import("@rc-component/trigger").ActionType[]) | undefined;
    showArrow?: (boolean | import("@rc-component/trigger").ArrowType) | undefined;
    fresh?: boolean | undefined;
    getTooltipContainer?: ((node: HTMLElement) => HTMLElement) | undefined;
    arrowContent?: import("react").ReactNode;
    overlayInnerStyle?: import("react").CSSProperties | undefined;
};
export default useTooltipProps;
