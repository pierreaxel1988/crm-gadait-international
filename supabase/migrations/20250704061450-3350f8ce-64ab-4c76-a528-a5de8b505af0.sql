-- Mettre à jour les templates d'emails avec le nouveau contenu amélioré

UPDATE email_templates 
SET content_template = '<p>J''espère que vous allez bien et que votre projet immobilier à Marbella progresse selon vos attentes.</p>

<p>Nos équipes ont identifié <strong>3 villas d''exception</strong> qui correspondent parfaitement à vos critères de recherche dans la gamme de <strong>35 millions d''euros</strong>.</p>

<p><strong>🏆 Sélection Premium Marbella :</strong></p>

<p><strong>1. Villa Exceptionnelle - La Zagaleta</strong><br>
📍 La Zagaleta, Marbella<br>
💰 <strong>30 000 000 €</strong><br>
🏡 2 200 m² • 9 chambres<br>
✨ <em>Technologie de pointe, sécurité maximale, golf privé</em></p>

<p><strong>2. Villa Solstice - Front de Golf</strong><br>
📍 Marbella<br>
💰 <strong>19 500 000 €</strong><br>
🏡 1 636 m² • 7 chambres<br>
⛳ <em>Vue golf panoramique, architecture contemporaine</em></p>

<p><strong>3. Villa Sierra Blanca - Vue Mer</strong><br>
📍 Sierra Blanca, Marbella<br>
💰 <strong>18 900 000 €</strong><br>
🏡 1 200 m² • 7 chambres<br>
🌊 <em>Vues mer panoramiques, quartier ultra-sécurisé</em></p>

<p>Ces propriétés bénéficient toutes d''un <strong>positionnement exceptionnel</strong> et d''un accès privilégié aux meilleures commodités de Marbella.</p>

<p style="margin-top: 30px;">
<a href="https://gadait-international.com" style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Découvrir la sélection complète</a>
</p>',
    subject_template = 'Votre projet immobilier {{location}} - 3 villas exceptionnelles sélectionnées'
WHERE day_number = 7;

UPDATE email_templates 
SET content_template = '<p>Le marché immobilier de <strong>Marbella</strong> confirme sa position de leader européen pour l''investissement de prestige.</p>

<p><strong>📈 Analyse de marché - {{month}} {{year}} :</strong></p>
<ul>
<li>Les propriétés +20M€ à Marbella affichent une <strong>progression de 15%</strong></li>
<li>Demande internationale soutenue depuis l''Espagne et les Émirats</li>
<li>Délais d''acquisition accélérés pour les biens d''exception</li>
</ul>

<p><strong>🌍 Perspective internationale :</strong><br>
En parallèle de Marbella, nos clients diversifient vers des marchés émergents exceptionnels :</p>

<p><strong>🏝️ Maurice - Opportunité Unique</strong><br>
<strong>Villa 6 chambres - Front de mer</strong><br>
💰 <strong>351 120 000 €</strong> • 729 m²<br>
🌊 <em>Accès direct plage privée, exonération fiscale</em></p>

<p><strong>🏙️ New York - Penthouse Central Park</strong><br>
<strong>7 chambres avec vue panoramique</strong><br>
💰 <strong>250 000 000 €</strong> • 1 630 m²<br>
🌆 <em>Central Park, Midtown, investissement exceptionnel</em></p>

<p><strong>💡 Stratégie recommandée :</strong><br>
Combinaison <strong>Marbella + International</strong> pour optimiser votre portefeuille immobilier de prestige.</p>

<p style="margin-top: 30px;">
<a href="https://gadait-international.com/properties" style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Explorer toutes les opportunités</a>
</p>',
    subject_template = 'Tendances exclusives marché {{location}} + Opportunités internationales - {{month}} {{year}}'
WHERE day_number = 14;

UPDATE email_templates 
SET content_template = '<p>Une <strong>opportunité exceptionnelle</strong> se présente sur notre villa phare de La Zagaleta.</p>

<p><strong>🏰 Villa d''Exception - La Zagaleta</strong></p>

<p><strong>✨ Caractéristiques remarquables :</strong></p>
<ul>
<li><strong>📍 Localisation :</strong> La Zagaleta - Marbella (quartier le plus exclusif)</li>
<li><strong>💰 Prix :</strong> 30 000 000 € (négociable)</li>
<li><strong>🏡 Surface :</strong> 2 200 m² habitables • 9 suites de maître</li>
<li><strong>🔧 Technologie :</strong> Domotique ultra-moderne, sécurité 24h/24</li>
<li><strong>⛳ Golf privé :</strong> Accès exclusif aux parcours de La Zagaleta</li>
</ul>

<p><strong>🎯 Avantages exclusifs :</strong></p>
<ul>
<li>🤝 <strong>Négociation directe</strong> avec le propriétaire</li>
<li>📋 <strong>Due diligence</strong> complètement finalisée</li>
<li>⚡ <strong>Acquisition rapide</strong> possible (30 jours)</li>
<li>🛡️ <strong>Garanties étendues</strong> sur tous les équipements</li>
</ul>

<p><strong>⏰ Fenêtre d''opportunité :</strong><br>
Le propriétaire étudie <strong>2 autres offres</strong>. Une réponse de principe avant vendredi nous permettrait de sécuriser la négociation.</p>

<p style="margin-top: 30px;">
<a href="https://www.el-unico.es/" style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Voir tous les détails</a>
</p>',
    subject_template = 'Villa La Zagaleta : Négociation exclusive ouverte'
WHERE day_number = 21;

UPDATE email_templates 
SET content_template = '<p>Après un mois d''analyses approfondies, voici le <strong>bilan complet</strong> de votre recherche immobilière à Marbella.</p>

<p><strong>📋 Récapitulatif - 30 jours de recherche :</strong></p>
<ul>
<li>✅ <strong>15 propriétés</strong> analysées dans votre gamme</li>
<li>🎯 <strong>5 visites virtuelles</strong> organisées</li>
<li>📊 <strong>3 évaluations</strong> de marché personnalisées</li>
<li>💼 <strong>2 négociations</strong> en cours</li>
</ul>

<p><strong>🏆 TOP 3 FINAL - Nos recommandations :</strong></p>

<p><strong>🥇 Coup de cœur : Villa La Zagaleta</strong><br>
💰 30M€ • 2200m² • 9 chambres<br>
<a href="https://www.el-unico.es/" style="color: #8B4513;">→ Voir la villa</a><br>
<em>Luxe absolu, technologie de pointe, négociation privilégiée</em></p>

<p><strong>🥈 Opportunité : Villa Solstice</strong><br>
💰 19,5M€ • 1636m² • 7 chambres<br>
<a href="https://www.villasolstice.es/" style="color: #8B4513;">→ Voir la villa</a><br>
<em>Front de golf, vues exceptionnelles, rapport qualité/prix optimal</em></p>

<p><strong>🥉 Prestige : Villa Sierra Blanca</strong><br>
💰 18,9M€ • 1200m² • 7 chambres<br>
<a href="https://www.rossini13.es/" style="color: #8B4513;">→ Voir la villa</a><br>
<em>Vues mer panoramiques, quartier ultra-sécurisé</em></p>

<p><strong>🎯 Plan d''action suggéré :</strong></p>
<ol>
<li>📞 <strong>Échange téléphonique</strong> cette semaine</li>
<li>✈️ <strong>Visite sur place</strong> organisée à Marbella</li>
<li>📄 <strong>Négociations</strong> simultanées sur 2 propriétés</li>
<li>⚖️ <strong>Décision finale</strong> avec tous les éléments</li>
</ol>

<p><strong>💡 Bonus - Diversification :</strong><br>
Opportunité exceptionnelle <strong>Villa Maurice 6 chambres</strong> (351M€) pour compléter votre portefeuille international.</p>

<p style="margin-top: 30px;">
<a href="https://gadait-international.com" style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Planifier notre rendez-vous</a>
</p>',
    subject_template = 'Bilan de votre recherche {{location}} - Sélection finale 35M€'
WHERE day_number = 30;