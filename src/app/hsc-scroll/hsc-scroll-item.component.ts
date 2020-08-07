export class ItemScroll {
    id: number;
    conteudo: string;
    // Liga ou desliga o spinner
    isExibirConteudo: boolean;
    isDestaque: boolean;

    constructor(id: number = 0, conteudo: string = '', isExibirConteudo: boolean = false, isDestaque: boolean = false) {
        this.id = id;
        this.conteudo = conteudo;
        this.isExibirConteudo = isExibirConteudo;
        this.isDestaque = isDestaque;
    }
}
