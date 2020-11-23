import './core/types';
import { CreateElement, VueConstructor } from 'vue';
import CanvasRoi from './core';
import './vue-roi.css';
import { RoiOptions } from './core/options';
declare const CanvasRoiComponent: {
    name: string;
    props: {
        readonly?: import("./core/options").PropOptions<any>;
        canvasScale?: import("./core/options").PropOptions<any>;
        globalStyles?: import("./core/options").PropOptions<any>;
        focusStyles?: import("./core/options").PropOptions<any>;
        operateFocusOnly?: import("./core/options").PropOptions<any>;
        operateCircle?: import("./core/options").PropOptions<any>;
        sensitive?: import("./core/options").PropOptions<any>;
        allowTypes?: import("./core/options").PropOptions<any>;
        singleType?: import("./core/options").PropOptions<any>;
        currentType?: import("./core/options").PropOptions<any>;
        pathCanMove?: import("./core/options").PropOptions<any>;
        digits?: import("./core/options").PropOptions<any>;
        distanceCheck?: import("./core/options").PropOptions<any>;
        tinyRectSize?: import("./core/options").PropOptions<any>;
        rectAspectRatio?: import("./core/options").PropOptions<any>;
        tinyCircleRadius?: import("./core/options").PropOptions<any>;
        blurStrokeOpacity?: import("./core/options").PropOptions<any>;
        ignoreInvalidSelect?: import("./core/options").PropOptions<any>;
        rectCursors?: import("./core/options").PropOptions<any>;
        maxPath?: import("./core/options").PropOptions<any>;
        autoFit?: import("./core/options").PropOptions<any>;
        initChoseIndex?: import("./core/options").PropOptions<any>;
        width?: import("./core/options").PropOptions<any>;
        height?: import("./core/options").PropOptions<any>;
        ready?: import("./core/options").PropOptions<any>;
        input?: import("./core/options").PropOptions<any>;
        change?: import("./core/options").PropOptions<any>;
        choose?: import("./core/options").PropOptions<any>;
        resize?: import("./core/options").PropOptions<any>;
        'draw-start'?: import("./core/options").PropOptions<any>;
        'draw-end'?: import("./core/options").PropOptions<any>;
        'modify-start'?: import("./core/options").PropOptions<any>;
        options: {
            type: ObjectConstructor;
            default: () => RoiOptions;
        };
        value: {
            type: ArrayConstructor;
            default: () => RoiPath[];
        };
    };
    data(): {
        $instanceId: number;
        $roi: CanvasRoi;
        selfCurrentType: string;
    };
    mounted(): void;
    destroy(): void;
    computed: {
        handledEvents(): {
            input?: () => void;
            change?: () => void;
            resize?: () => void;
            ready?: () => void;
            choose?: () => void;
            "draw-start"?: () => void;
            "draw-end"?: () => void;
            "modify-start"?: () => void;
        };
        handledOptions(): any;
    };
    watch: {
        value: string;
        handledOptions: string;
    };
    methods: {
        callInstanceMethod(methodName: string, ...args: any[]): any;
        updateValue(value: RoiPath[]): void;
        emitEvent(name: ROIEvents, ...args: any[]): void;
        resetVueOptions(value: RoiOptions): void;
    };
    render(h: CreateElement): import("vue").VNode;
    install(Vue: VueConstructor): void;
};
export default CanvasRoiComponent;
