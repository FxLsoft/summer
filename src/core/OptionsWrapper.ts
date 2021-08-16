import { Autowired, Bean } from "./context/Context";
import { Options } from "./Summer";

function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

@Bean('optionsWrapper')
export class OptionsWrapper {
    
    @Autowired('options') private options: Options;

    public isDebug() {
        return isTrue(this.options.debug);
    }
}