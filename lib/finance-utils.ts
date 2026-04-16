export interface Parcela {
  vencimento: Date;
  valor_bruto: number;
  valor_liquido: number;
}

/**
 * Gera as parcelas de uma venda.
 * @param total Valor total da venda
 * @param numParcelas Número de parcelas
 * @param taxaMeio Taxa do meio de pagamento (em porcentagem, ex: 2.99)
 * @param dataInicio Data do primeiro vencimento
 */
export function generateInstallments(
  total: number,
  numParcelas: number,
  taxaMeio: number,
  dataInicio: Date = new Date()
): Parcela[] {
  if (numParcelas <= 0) return [];

  const parcelas: Parcela[] = [];
  
  // Calcula o valor bruto base por parcela (arredondado para baixo em centavos)
  const valorBrutoBase = Math.floor((total / numParcelas) * 100) / 100;
  // Calcula a diferença que sobrou devido ao arredondamento
  const resto = parseFloat((total - (valorBrutoBase * numParcelas)).toFixed(2));

  for (let i = 0; i < numParcelas; i++) {
    const vencimento = new Date(dataInicio);
    // Incrementa os meses para cada parcela
    vencimento.setMonth(vencimento.getMonth() + i);
    
    // Adiciona o resto (se houver) na primeira parcela para garantir que o total bata
    const valorBruto = i === 0 ? valorBrutoBase + resto : valorBrutoBase;
    
    // Aplica a taxa do meio de pagamento sobre o valor bruto da parcela
    const valorLiquido = valorBruto * (1 - taxaMeio / 100);

    parcelas.push({
      vencimento,
      valor_bruto: parseFloat(valorBruto.toFixed(2)),
      valor_liquido: parseFloat(valorLiquido.toFixed(2)),
    });
  }

  return parcelas;
}
