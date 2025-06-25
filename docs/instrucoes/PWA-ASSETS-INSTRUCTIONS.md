# Instruções para Assets PWA - IkigaiHub

## Assets Criados

Os seguintes templates SVG foram criados na pasta `public/`:

- `pwa-192x192.svg` - Ícone PWA 192x192px
- `pwa-512x512.svg` - Ícone PWA 512x512px  
- `apple-touch-icon.svg` - Ícone Apple Touch 180x180px
- `masked-icon.svg` - Ícone mascarado 512x512px
- `og-image.svg` - Imagem Open Graph 1200x630px
- `favicon.svg` - Favicon 32x32px (atualizado)

## Conversão para PNG

### Opção 1: Ferramentas Online
1. Acesse [SVG to PNG Converter](https://convertio.co/svg-png/) ou similar
2. Faça upload do arquivo SVG
3. Configure as dimensões corretas
4. Baixe o PNG

### Opção 2: Inkscape (Gratuito)
1. Abra o SVG no Inkscape
2. File → Export PNG Image
3. Configure as dimensões
4. Export

### Opção 3: GIMP/Photoshop
1. Abra o SVG
2. Export como PNG
3. Configure as dimensões

## Dimensões Necessárias

| Arquivo | Dimensões | Uso |
|---------|-----------|-----|
| `pwa-192x192.png` | 192x192px | Ícone PWA padrão |
| `pwa-512x512.png` | 512x512px | Ícone PWA alta resolução |
| `apple-touch-icon.png` | 180x180px | Dispositivos Apple |
| `masked-icon.png` | 512x512px | Ícone mascarado PWA |
| `og-image.png` | 1200x630px | Compartilhamento social |

## Design System

### Cores Utilizadas
- **Verde Principal**: `#10B981`
- **Verde Escuro**: `#059669` 
- **Preto**: `#111827`
- **Branco**: `#FFFFFF`
- **Cinza**: `#9CA3AF`

### Elementos do Design
- Fundo preto arredondado
- Círculo verde central
- Raio branco (símbolo de energia/vida)
- Anel verde externo
- Texto "IKIGAI" em verde

## Otimização

### Para PNGs
1. Use compressão sem perda
2. Mantenha transparência onde necessário
3. Teste em diferentes dispositivos

### Para PWA
1. Verifique se os ícones aparecem corretamente
2. Teste a instalação em dispositivos móveis
3. Valide o compartilhamento social

## Teste

Após a conversão, teste:

1. **PWA Installation**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Verificar no DevTools**:
   - Application → Manifest
   - Application → Service Workers

3. **Teste Mobile**:
   - Abra no Chrome Mobile
   - Verifique se aparece "Adicionar à tela inicial"

## Próximos Passos

1. Converter SVGs para PNGs
2. Substituir os arquivos SVG pelos PNGs
3. Testar a instalação PWA
4. Validar compartilhamento social 