# Documentation pour systeme alèrte de Marie-Françoise de Pitray

## 1. Objectif :
Pour permettre une autonomie confortable a Marie-Françoise, tout en gardant une sécurité contre des chutes ou des malaises qui pourraient entrainer de graves répercutions.

**Pour avoir une solution "invisible", nous avions cherché un élément qui :**

- *Peut se porter constament, meme sous/dans l'eau (douche, cuisine, etc.),*
- *N'a pas besoin d'être recharger* *(les piles durent pendant 6 mois d'utilisation quotidienne)*
- *Détecte automatiquement les chutes, et peut déclencher une alarme tout seul (avec option d'annulation en cas d'activation accidentelle),*
- *Une portée suffisante pour couvrir jusqu'au parking derriere la maison.*


## 2. Rayon éstimé d'éfficacité :
<br/>
<img src="rayon-la-ferme.png" height="400"/>

## 3. Le comportement du systeme :

1. Marie-Françoise est la premiere a être appellée, ainsi elle peut :
   - *Confirmer que le systeme s'est mis en route (en entendant son téléphone sonner)*
   - *Annuler l'appel en cas d'erreur.*
   - *Si pas de réponse de sa part, l'alerte continue comme prévu.*
2. Le systeme déclenchera des appels en **sequence** , en essayant de joindre chaque membre avant de passer au suivant, **meme si le membre ne répond pas.**
3. Le systeme **répétera la liste en boucle** jusqu'a trouver un membre qui *accepte de prendre en charge la situation.*

```mermaid
%% https://mermaid-js.github.io/mermaid/#/flowchart?id=flowchart-orientation
%% TODO: Try this as a stateDiagram?
flowchart TB
   classDef useraction fill:pink;
   classDef automatic fill:turquoise;
   subgraph "Déclenchement alarme"
      direction LR
      C[Bouton Appuyé Manuellement]:::useraction  --> D{Appeller Membre \navec instructions vocal}:::automatic
   end
   subgraph "Detection de Chute Automatique"
      A[Bracelet detecte une chute]:::useraction  --> B{Bracelet commence \na sonner pour 5s}
      B -->|Si appui bouton| Z[fa:fa-ban Annulation]
      B:::automatic ---->|Apres 10 secondes| D
   end
   subgraph "Chercher un intevenant"
      D ----> |Appel telephonique| E{Telephone du membre}:::useraction
      E -->|Pas de réponse| F
      E -->|Appuyer sur '1'\n'decliner'| F[Membre ne peut pas intervenir] --> |Passer au membre suivant| D
      E -->|Appuyer sur '2'\n'accepté'| G[Envoi SMS 'Contact' a ce membre]:::automatic
      G --> H(Cliquer sur le lien):::useraction
      H --> I(Envoyer SMS\n'tout va bien' a\n chaque membre\nde la liste):::automatic
    end
```

## 4. Accepter d'intervenir

En appuyant sur "1" lors d'un appel, vous prenez en charge la situation. A partir de ce moment, il n'y aura plus d'actions automatiques, le système cessera d'appeller en sequence, etc.

**Vous n'êtes pas obligé d'être sur place pour accepter - il suffit d'avoir la volonter de prendre en main la situation, et appeller d'autres et/ou les pompiers pour faire avancer les choses.**

## 5. Ok, j'accepte. Quoi maintenant ?

Si vous êtes en mesure de vous déplacer a la ferme, c'est un moyen sur de verifier ce qu'il se passe. Sinon, vous pouvez commencer a appeller des autres qui serait susceptibles a pouvoir le faire.

A cet effet, vous recevrez un message d'accompagnement comme ceci, avec les informations pour contacter d'autres gens dans la région ou qui pourrait être concernées :

<img src="alerte-sms.jpeg" height="350"/>
- lien ->   
<img src="site-tout-va-bien.png" height="350"/>

*En bas du SMS se figure un lien qui redirige vers notre site web, qui permet de signaler aux autres que la situation est réglée*



## 7. Plus loin ?

D'autres fonctionalitées envisagées :
- Possibilité d'envoyer ces messages/ces appels via **WhatsApp**
- Possibilité de rajouter un lien vers un groupe **WhatsApp** pour faciliter la communication
- Possibilité de répondre/envoyer un SMS au numèro du systeme d'alerte pour redistribution a tout le monde.
- Rajouter un répondeur avec des informations/l'envoi du SMS automatique si rappel

