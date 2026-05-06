UPDATE public.brands SET sort_order = CASE id
  WHEN 'shell' THEN 1
  WHEN 'motolube' THEN 2
  WHEN 'g4' THEN 3
  WHEN 'engen' THEN 4
  WHEN 'castrol' THEN 5
  WHEN 'blixem' THEN 6
  WHEN 'fuchs' THEN 7
  WHEN 'winners' THEN 8
  WHEN 'valvoline' THEN 9
  WHEN 'newlook' THEN 10
  WHEN 'extreme' THEN 11
  WHEN 'plexus' THEN 12
  WHEN 'bmw' THEN 13
  WHEN 'ngk' THEN 14
END
WHERE id IN ('shell','motolube','g4','engen','castrol','blixem','fuchs','winners','valvoline','newlook','extreme','plexus','bmw','ngk');