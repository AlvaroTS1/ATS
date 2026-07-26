import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const EMAIL = 'contato@atssistemas.ia.br';

const TermsOfUse: React.FC = () => {
  return (
    <LegalLayout
      title="Termos de Uso"
      updatedAt="26 de julho de 2026"
      intro={
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do site
          institucional da{' '}
          <strong className="text-white">ATS Sistemas de Automações</strong>{' '}
          (
          <a
            href="https://www.atssistemas.ia.br"
            className="text-neon-cyan hover:underline"
          >
            atssistemas.ia.br
          </a>
          ). Ao navegar por este site, você concorda com as condições descritas
          abaixo.
        </p>
      }
    >
      <LegalSection title="1. Objeto">
        <p>
          Este site tem caráter informativo e apresenta a ATS Sistemas de
          Automações e o seu ecossistema de produtos (como Reencontra, Fusion
          Buy AI e Coffee Break), além de permitir o contato com a empresa e o
          cadastro em listas de espera de novos lançamentos.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso do site">
        <p>Ao utilizar este site, você concorda em:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Fornecer informações verdadeiras nos formulários;</li>
          <li>
            Não utilizar o site para fins ilícitos ou que violem estes Termos ou
            a legislação vigente;
          </li>
          <li>
            Não tentar comprometer a segurança, a integridade ou a
            disponibilidade do site.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Produtos e serviços de terceiros">
        <p>
          Alguns produtos apresentados podem ser acessados por meio de sites,
          aplicativos ou lojas de aplicativos próprios (como a Google Play). O
          uso desses produtos está sujeito a termos e políticas específicos de
          cada solução, que podem diferir destes Termos.
        </p>
      </LegalSection>

      <LegalSection title="4. Propriedade intelectual">
        <p>
          Os conteúdos deste site — incluindo marca, logotipos, textos, layout,
          identidade visual e elementos gráficos — pertencem à ATS Sistemas de
          Automações ou a seus licenciadores e são protegidos pela legislação
          aplicável. É vedada a reprodução, distribuição ou uso sem autorização
          prévia e por escrito.
        </p>
      </LegalSection>

      <LegalSection title="5. Limitação de responsabilidade">
        <p>
          Empregamos esforços para manter as informações do site corretas e
          atualizadas, mas elas são fornecidas &ldquo;no estado em que se
          encontram&rdquo;, sem garantias de disponibilidade ininterrupta ou
          ausência de erros. A ATS não se responsabiliza por danos decorrentes
          do uso ou da impossibilidade de uso do site, na máxima extensão
          permitida pela lei.
        </p>
      </LegalSection>

      <LegalSection title="6. Links externos">
        <p>
          Este site pode conter links para páginas de terceiros. Não temos
          controle sobre esses conteúdos e não nos responsabilizamos por suas
          práticas de privacidade ou por seu conteúdo.
        </p>
      </LegalSection>

      <LegalSection title="7. Privacidade">
        <p>
          O tratamento de dados pessoais realizado por meio deste site é regido
          pela nossa{' '}
          <Link
            to="/privacidade"
            className="text-neon-cyan hover:underline"
          >
            Política de Privacidade
          </Link>
          , em conformidade com a LGPD.
        </p>
      </LegalSection>

      <LegalSection title="8. Alterações destes Termos">
        <p>
          Estes Termos podem ser atualizados a qualquer momento. A versão
          vigente é sempre a publicada nesta página, com a data de atualização
          indicada no início do documento.
        </p>
      </LegalSection>

      <LegalSection title="9. Foro e legislação aplicável">
        <p>
          Estes Termos são regidos pela legislação brasileira. Fica eleito o
          foro da comarca de Espumoso/RS para dirimir eventuais controvérsias,
          salvo disposição legal em contrário.
        </p>
      </LegalSection>

      <LegalSection title="10. Contato">
        <p>
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo
          e-mail{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-neon-cyan hover:underline break-all"
          >
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
};

export default TermsOfUse;
