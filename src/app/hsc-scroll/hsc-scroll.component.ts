import { Location } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ItemScroll } from './hsc-scroll-item.component';

@Component({
  selector: 'app-hsc-scroll',
  templateUrl: './hsc-scroll.component.html',
  styleUrls: ['./hsc-scroll.component.css']
})
export class HscScrollComponent implements OnInit, OnChanges {

  @Input() recData: ItemScroll[] = [new ItemScroll(0)];
  @Input() recItemSelecionado: ItemScroll;
  @Input() recSelecinaClass = '';
  @Input() valuesCacheSize = 5;

  @Input() infScrollDistance = 1;
  @Input() infScrollThrottle = 150;
  @Input() infScrollUpDistance = 2;

  @Output() aoItemNextItem = new EventEmitter<ItemScroll[]>();
  @Output() aoItemSelecionado = new EventEmitter<ItemScroll>();

  private itemDestaque: ItemScroll;
  private arrayvisualizacao: ItemScroll[] = [];
  private posicaoIniDown = 0;
  private posicaoFimDown = 0;
  private posicaoIniUp = 0;
  private posicaoFimUp = 0;
  private reiniciarContagemUp = false;

  constructor(private location: Location) {}

  /**
   * Metodo que definine o item que terá um destaque 'isDestaque' ou não.
   *
   * @param itens ItemScroll[]
   * @param index number
   * @param isDestaque boolean
   */
  public static recolherVisualizacaoDestaqueItem(itens: ItemScroll[], index: number, isDestaque: boolean): void {
    itens.forEach(it => {
      if (it.isDestaque) {
        it.isDestaque = false;
      }
    });

    itens[index].isDestaque = isDestaque;
  }

  /**
   * Metodo responsavel por coletar a informação da posição do objeto na lista.
   *
   * @param itens ItemScroll[]
   * @param item ItemScroll
   */
  public static getIndex(itens: ItemScroll[], item: ItemScroll): number {
    let index = 0;
    for (let i = 0; i <= itens.length; i++) {
      if (item.id === itens[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * Usado para inicializar a lista com a primeira opção selecionada.
   */
  public ngOnInit(): void {
    (window as any).pdfWorkerSrc = this.location.prepareExternalUrl('/assets/pdf.worker.js');

    this.posicaoFimUp = this.infScrollUpDistance;
    this.posicaoFimDown = this.infScrollUpDistance;

    const item: ItemScroll = this.recData[0];
    const pIndex = HscScrollComponent.getIndex(this.recData, item);

    const pFimIndexMenos = pIndex - this.valuesCacheSize;
    const pFimIndexMais = pIndex + this.valuesCacheSize;

    this.recolherVisualizacaoTodos(this.recData, false, item);
    this.recolherVisualizacaoPeriodo(this.recData, pFimIndexMenos, pFimIndexMais, true);
    this.atribuirFocoEscolhaItemVisualizacao(item);
  }

  /**
   * Escuta as informações de escolha de item.
   *
   * @param changes SimpleChanges
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.recItemSelecionado && changes.recItemSelecionado.currentValue) {
      if (changes.recItemSelecionado.currentValue === this.recItemSelecionado) {
        this.controlarFluxoMudanca(this.recItemSelecionado);
      }
    }
  }

  /**
   * Controla o recebimento das mudança no objeto selecionado.
   *
   * @param item ItemScroll
   */
  private controlarFluxoMudanca(item: ItemScroll): void {
    const pIndex = HscScrollComponent.getIndex(this.recData, item);
    const pFimIndexMenos = pIndex - this.valuesCacheSize;
    const pFimIndexMais = pIndex + this.valuesCacheSize;

    this.recolherVisualizacaoTodos(this.recData, false);
    this.recolherVisualizacaoPeriodo(this.recData, pFimIndexMenos, pFimIndexMais, true);
    this.atribuirFocoEscolhaItemVisualizacao(item);

    HscScrollComponent.recolherVisualizacaoDestaqueItem(this.recData, pIndex, true);
  }

  public exibirConteudo(item: ItemScroll): void {
    item.isExibirConteudo = !item.isExibirConteudo;
  }

  /**
   * Realiza o mover dos dados para baixo.
   */
  public onScrollDown(): void {
    const isPosicaoIni = (this.posicaoIniDown < this.recData.length);
    const isPosicaoFim = (this.posicaoFimDown < this.recData.length);

    if (isPosicaoIni) {
      this.posicaoIniDown = this.posicaoFimDown;

      if (this.posicaoIniDown > this.recData.length) {
          this.posicaoIniDown = this.recData.length;
      }
    }

    if (isPosicaoFim) {
      this.posicaoFimDown += this.infScrollUpDistance;

      if (this.posicaoFimDown > this.recData.length) {
          this.posicaoFimDown = this.recData.length;
      }
    }

    if (isPosicaoIni || isPosicaoFim) {
      this.scrollDown(this.posicaoIniDown, this.posicaoFimDown);
    }
  }

  private scrollDown(posicaoIni, posicaoFim): void {
    for (let i = posicaoIni; i < posicaoFim; ++i) {
      const itemNext = this.recData[i];
      if (itemNext !== undefined) {
        this.arrayvisualizacao.push(itemNext);
      }
    }
  }

  public onScrollUp(): void {
    const isPosicaoIni = (this.posicaoIniUp < this.recData.length) && this.posicaoIniDown !== 0;
    const isPosicaoFim = (this.posicaoFimUp < this.recData.length) && this.posicaoIniDown !== 0;

    if (!this.reiniciarContagemUp) {
      if (isPosicaoIni) {
        this.posicaoIniUp = this.posicaoIniUp - this.infScrollUpDistance;
        if (this.posicaoIniUp <= -1) {
          this.posicaoIniUp = 0;
        }
      }

      if (isPosicaoFim) {
        this.posicaoFimUp = this.posicaoFimUp - this.infScrollUpDistance;
        if (this.posicaoFimUp < 0) {
          this.posicaoFimUp = -1;
        }
      }
    }

    if (isPosicaoIni || isPosicaoFim || this.reiniciarContagemUp) {
      this.reiniciarContagemUp = false;
      this.scrollUp(this.posicaoIniUp, this.posicaoFimUp);
    }
  }

  private scrollUp(posicaoIni: number, posicaoFim: number): void {
    for (let i = posicaoFim; i >= posicaoIni; --i) {
      const itemNext = this.recData[i];
      if (itemNext !== undefined) {
        this.arrayvisualizacao.unshift(itemNext);
      }
    }
  }

  /**
   * Devolve a notificação para o objeto pai.
   *
   * @param item ItemScroll
   */
  public notificarDestacarItem(item: ItemScroll): void {
    const pIndex = HscScrollComponent.getIndex(this.recData, item);
    const isProximo = this.verificarSeProximoVisivelDentroLimite(this.recData, pIndex);
    // 1) Verificar se o itens de destaque foi atribuido é e diferente do requisitado.
    // 2) Verificar se é necessário novos itens no 'isProximo'
    if ((this.itemDestaque === undefined || this.itemDestaque.id !== item.id)  || isProximo) {
      // Seta o valor do itens em destaque
      this.itemDestaque = item;
      // O proximo item da lista esta com visibilidade falsa ou não.
      if (!item.isExibirConteudo || isProximo) {
        const pFimIndexMenos = pIndex - this.valuesCacheSize;
        const pFimIndexMais = pIndex + this.valuesCacheSize;
        // Remove a visualização dos itens.
        this.recolherVisualizacaoTodos(this.recData, false, item);
        // Atribui a visualização dos itens do período para 'true'
        this.recolherVisualizacaoPeriodo(this.recData, pFimIndexMenos, pFimIndexMais, true);
      }
      // Emitir notificacao item em destaque
      this.aoItemSelecionado.emit(item);
    }
  }

  /**
   * Verifica se o próximo esta dentro do limite de visualização.
   * Ex: Minha visualização é de 10 até 20 posições; Então preciso saber quando
   *  cheguei a posição 10 ou 20 para solicitar mais dados de 1 à 10 ou 20 à 30.
   *
   * @param itens ItemScroll[]
   * @param pIndex number
   */
  private verificarSeProximoVisivelDentroLimite(itensGerais: ItemScroll[], pIndex: number): boolean {
    // Se a X posição do array geral é igual a última posição de visualização que é igual a posição pIndex
    const resulDown = (itensGerais[pIndex + 1]?.isExibirConteudo === false);
    // Se a X posição do array geral é igual a primeira posição de visualização que é igual a posição pIndex
    const resulUp = (itensGerais[pIndex - 1]?.isExibirConteudo === false);

    if (resulDown || resulUp) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Atribuir ao objeto escolhido o efeito de foco scroll.
   *
   * @param el: string
   */
  private atribuirFocoEscolhaItemVisualizacao(item: ItemScroll): void {
    // Não existe o elemento carregado na visualização
    if (document.getElementById(String(item.id)) == null) {
      this.visualizacaoFocoEscolha(item);
      // Realizar o foco na opção desejada
      setTimeout(() => {
        const el = document.getElementById(String(item.id));
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 1000);
    } else {
      // Existe o elemento carregado na visualização
      const el = document.getElementById(String(item.id));
      el.scrollIntoView();
    }
  }

  private visualizacaoFocoEscolha(item: ItemScroll): void {
    // Limpar visualização alivio de memoria
    this.arrayvisualizacao = [];
    // Usado para orientar o scrollUp quando requisitado na proxima vez.
    this.reiniciarContagemUp = true;

    const index = HscScrollComponent.getIndex(this.recData, item);
    // Criar posições com valores de pVariavel - incremento Ex. 30 - 5 = 25
    this.posicaoIniUp = index - this.infScrollUpDistance;
    // Criar posições com valores de pVariavel - 1 Ex. 30 - 1 = 29
    this.posicaoFimUp = index  - 1;
    // Caso os valores possuam posições menores atribuir 0
    if (this.posicaoIniUp < 0 && this.posicaoFimUp < 0) {
      this.posicaoIniUp = 0;
      this.posicaoFimUp = 0;
    }
    // Resumo ScrollUP: Incrementa array com exemplo 25 até 29 na próxima rolagem.

    // Criar posições com valores de pVariavel. Ex. 30
    this.posicaoIniDown = index;
    // Criar posições com valores de pVariavel + incremento. Ex. 30 + 5 = 35
    this.posicaoFimDown = index  + this.infScrollUpDistance;
    // Resumo ScrollDown: Incrementa array com exemplo 30 até 35
    this.scrollDown(this.posicaoIniDown, this.posicaoFimDown);
  }

  private recolherVisualizacaoTodos(itens: ItemScroll[], isExibirVisualizacao: boolean, itemExclude?: ItemScroll): void {
    itens.forEach(it => {
      if (it.isExibirConteudo && (itemExclude !== undefined && itemExclude.id !== it.id)) {
        it.isExibirConteudo = isExibirVisualizacao;
      }
    });
  }

  private recolherVisualizacaoPeriodo(itens: ItemScroll[], iniIndex: number, fimIndex: number, isExibirVisualizacao: boolean): void {
    const itensExibirConteudo: ItemScroll[] = [];
    for (let i = iniIndex; i <= fimIndex; i++) {
      if (itens[i] !== undefined) {
        itensExibirConteudo.push(itens[i]);
      }
    }
    if (itensExibirConteudo.length > 0) {
      // Requisitar novos dados ao objeto.
      this.aoItemNextItem.emit(itensExibirConteudo);
    }
  }
}
