
import React from 'react';
import { ExternalLink, Clock, Send, Search, ArrowUp, ArrowDown, RefreshCw, Edit, Mail, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface LeadEmail {
  id: string;
  lead_id: string;
  date: string;
  subject: string | null;
  snippet: string | null;
  is_sent: boolean;
  gmail_message_id: string;
  sender?: string;
  recipient?: string;
  body_text?: string;
  body_html?: string;
}

interface EmailListProps {
  emails: LeadEmail[];
  filteredEmails: LeadEmail[];
  connectedEmail: string | null;
  isRefreshing: boolean;
  searchTerm: string;
  sortOrder: 'asc' | 'desc';
  syncEmailsWithGmail: () => void;
  sendNewEmail: () => void;
  setSearchTerm: (term: string) => void;
  toggleSortOrder: () => void;
  formatDate: (dateString: string) => string;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  filteredEmails,
  connectedEmail,
  isRefreshing,
  searchTerm,
  sortOrder,
  syncEmailsWithGmail,
  sendNewEmail,
  setSearchTerm,
  toggleSortOrder,
  formatDate,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-white border-b">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-loro-terracotta" />
            <div>
              <p className="text-sm font-medium">Connecté avec:</p>
              <p className="text-xs text-gray-500">{connectedEmail}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={syncEmailsWithGmail} disabled={isRefreshing} className="flex items-center gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Synchroniser</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button size="sm" onClick={sendNewEmail} className="flex items-center gap-1.5 bg-loro-terracotta hover:bg-loro-dark">
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouveau message</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans les emails..."
              className="pl-8"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSortOrder}
            className="h-10 w-10"
            title={sortOrder === 'desc' ? "Plus récents d'abord" : "Plus anciens d'abord"}
          >
            {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2 pt-2 pb-24">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-8 px-4">
            {emails.length === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 rounded-full p-3">
                  <Inbox className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Aucun email trouvé pour ce lead.</p>
                <Button variant="outline" size="sm" onClick={syncEmailsWithGmail} className="mt-1">
                  Synchroniser avec Gmail
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 rounded-full p-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Aucun résultat pour "<span className="font-medium">{searchTerm}</span>"</p>
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="mt-1">
                  Effacer la recherche
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredEmails.map(email => (
              <div key={email.id} className="border rounded-md p-3 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {email.is_sent ? (
                        <Badge variant="default" className="bg-loro-terracotta/90 text-xs py-0.5 gap-1 flex items-center">
                          <Send className="h-3 w-3" />
                          Envoyé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-loro-chocolate border-loro-chocolate text-xs py-0.5 gap-1 flex items-center">
                          <Inbox className="h-3 w-3" />
                          Reçu
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {formatDate(email.date)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full" 
                    title="Ouvrir dans Gmail"
                    onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.gmail_message_id}`, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <Accordion type="single" collapsible className="w-full mt-1">
                  <AccordionItem value="content" className="border-0">
                    <AccordionTrigger className="py-1.5 hover:no-underline">
                      <h3 className="font-medium text-sm text-left">{email.subject || '(Sans objet)'}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-t pt-2 mt-1">
                        {email.is_sent ? (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold">À:</span> {email.recipient || 'N/A'}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold">De:</span> {email.sender || 'N/A'}
                          </div>
                        )}
                        
                        <div className="mt-3 text-sm">
                          {email.body_html ? (
                            <div dangerouslySetInnerHTML={{ __html: email.body_html }} className="prose prose-sm max-w-none" />
                          ) : email.body_text ? (
                            <div className="whitespace-pre-wrap">{email.body_text}</div>
                          ) : (
                            <div>{email.snippet || ''}</div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {!email.body_html && !email.body_text && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{email.snippet || ''}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EmailList;
