import { Autowired, Bean } from "./context/Context";
import type { SrOptions } from "./SummerOptions";

function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

@Bean('optionsWrapper')
export class OptionsWrapper {
    
    @Autowired('options') private options: SrOptions;

    public isDebug() {
        return isTrue(this.options.debug);
    }
}