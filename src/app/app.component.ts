import { Component, OnInit } from '@angular/core';
import { ItemScroll } from './hsc-scroll/hsc-scroll-item.component';
import { HscScrollComponent } from './hsc-scroll/hsc-scroll.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  documentos: ItemScroll[] = [];
  itemSelecionado: ItemScroll;
  classSelecionada = '.cell-visualizador';

  constructor(public location: Location) {}

  // Dados de teste
  ngOnInit(): void {
    const list = [];
    list[0] = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
    list[1] = this.location.prepareExternalUrl('/assets/1.pdf');
    list[2] = this.location.prepareExternalUrl('/assets/2.pdf');
    // list[3] = this.location.prepareExternalUrl('/assets/3.pdf');
    // list[4] = this.location.prepareExternalUrl('/assets/4.pdf');
    // list[5] = this.location.prepareExternalUrl('/assets/5.pdf');
    // list[6] = this.location.prepareExternalUrl('/assets/6.pdf');

    this.documentos.push(new ItemScroll(0, list[0], true, true));
    for ( let cont = 1; cont < 200 ; cont++) {
      const n = Math.floor(Math.random() * 7);
      this.documentos.push(new ItemScroll(cont));
    }

    setTimeout(() => {
      for ( let cont = 200; cont < 400 ; cont++) {
        const n = Math.floor(Math.random() * 7);
        this.documentos.push(new ItemScroll(cont, list[2]));
      }
    }, 10000);
  }

  /**
   * Notificar o scroll que quero visualizar esse item
   * 
   * @param item ItemScroll
   */
  selecionadoItem(item: ItemScroll) {
    this.itemSelecionado = this.buscarItem(item);
  }

  /**
   * Receber item selecionado.
   * 
   * @param item ItemScroll 
   */
  receberItemSelecionado(item: ItemScroll) {
    const index = HscScrollComponent.getIndex(this.documentos, item);
    HscScrollComponent.recolherVisualizacaoDestaqueItem(this.documentos, index, true);
  }

  /**
   * Receber requisição de novos dados.
   *
   * @param itens ItemScroll[]
   */
  receberNextItem(itens: ItemScroll[]) {
    itens.forEach(it => {
      this.buscarItem(it);
    });
  }

  // Local de busca do serviço
  private buscarItem(item: ItemScroll): ItemScroll {
    const index = HscScrollComponent.getIndex(this.documentos, item);

    if (!item.conteudo) {
      this.documentos[index].conteudo = this.location.prepareExternalUrl('/assets/2.pdf');
    }

    // Aguarda 3s para providência a exibição
    setTimeout(() => {
      this.documentos[index].isExibirConteudo = true;
    }, 3000);

    return this.documentos[index];
  }

}
