# Istruzioni per Build Nativa iOS

Segui questi passaggi per creare una build nativa da installare sull'iPad con pieno supporto al feedback aptico.

## Prerequisiti

1. **Account Expo** (gratuito)
   - Crea un account su [expo.dev](https://expo.dev) se non ne hai uno

2. **Account Apple** (gratuito)
   - Serve solo l'Apple ID, non serve l'Apple Developer Program a pagamento

## Step 1: Installa EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login ad Expo

```bash
eas login
```

Inserisci le credenziali del tuo account Expo.

## Step 3: Configura il progetto

```bash
eas build:configure
```

Questo comando creerà automaticamente la configurazione necessaria.

## Step 4: Crea la build per iPad

Hai due opzioni:

### Opzione A: Development Build (consigliata per testing)

```bash
eas build --platform ios --profile development
```

Questa build:
- Include il development client per hot reload
- Può essere installata su dispositivi registrati
- Ideale per testing e sviluppo

### Opzione B: Build Preview (più vicina alla produzione)

```bash
eas build --platform ios --profile preview
```

Questa build:
- Simile alla versione production
- Più leggera della development
- Migliore performance

## Step 5: Registra l'iPad

Durante il processo di build, EAS ti chiederà di:

1. **Registrare il dispositivo**:
   - Apri il link che ti viene fornito dall'iPad
   - Scarica il profilo di provisioning
   - Installa il profilo (Impostazioni > Generale > Profili)

2. EAS registrerà automaticamente l'UDID del tuo iPad

## Step 6: Attendi il completamento

La build richiede circa 10-20 minuti. Puoi:
- Aspettare nel terminale
- Chiudere il terminale e controllare su [expo.dev/builds](https://expo.dev/builds)

## Step 7: Installa sull'iPad

Quando la build è completa:

1. **Riceverai un link** via email o lo vedrai nel terminale
2. **Apri il link dall'iPad**
3. **Premi "Install"**
4. **Autorizza l'installazione** se richiesto
5. **Vai in Impostazioni > Generale > Gestione Dispositivo**
6. **Autorizza il certificato** del developer

## Comandi Utili

```bash
# Vedi lo stato di tutte le build
eas build:list

# Cancella una build
eas build:cancel

# Resetta le credenziali
eas credentials
```

## Troubleshooting

### "Unable to install app"
- Vai in Impostazioni > Generale > Gestione Dispositivo
- Autorizza il certificato del developer

### "Certificato scaduto"
- Ricrea la build, EAS genererà nuovi certificati:
  ```bash
  eas build --platform ios --profile development --clear-cache
  ```

### "Dispositivo non registrato"
- Assicurati di aver installato il profilo di provisioning
- Riprova la build:
  ```bash
  eas device:create
  ```

## Alternative: Build Locale (se hai Xcode)

Se hai Xcode installato su Mac:

```bash
# Installa le dipendenze native
npx expo prebuild

# Esegui su iPad connesso
npx expo run:ios --device
```

## Costi

- **EAS Build gratuito**: 30 build/mese
- **Nessun costo Apple** per testing (non serve Apple Developer Program a pagamento)
- Per pubblicare su App Store serve Apple Developer Program ($99/anno)

---

## Prossimi Passi

Una volta installata la build nativa:
1. Il feedback aptico funzionerà al 100%
2. Le performance saranno migliori
3. L'app sarà installata permanentemente (non serve Expo Go)

Buona fortuna! 🚀
